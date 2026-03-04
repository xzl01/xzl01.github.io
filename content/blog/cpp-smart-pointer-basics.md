---
title: "C++ 智能指针基础"
date: 2026-03-04
description: "&#x20;堆栈与RAII中提到了一种能防止在使用父类指针指向子类时出现的内存泄漏的类`shape_wrapper` 这其实就是智能指针的雏形。 使用智能指针可以简化和完善资源管理。 这个类只适用于shape类 所以缺了..."
categories: ["C++", "内存管理"]
tags: ["C++", "智能指针", "RAII"]
---
&#x20;[堆栈与RAII](堆栈与RAII_vQT4cTpffqvNy5T8VT5vWR.md "堆栈与RAII")中提到了一种能防止在使用父类指针指向子类时出现的内存泄漏的类`shape_wrapper` 这其实就是智能指针的雏形。

使用智能指针可以简化和完善资源管理。

```c++
class shape_wrapper {
public:
  explicit shape_wrapper(
    shape* ptr = nullptr)
    : ptr_(ptr) {}
  ~shape_wrapper()
  {
    delete ptr_;
  }
  shape* get() const { return ptr_; }
private:
  shape* ptr_;
};
```

这个类只适用于shape类 所以缺了点东西

1. 这个类只适用于 shape 类
2. 该类对象的行为不够像指针
3. 拷贝该类对象会引发程序行为异常

利用[函数模板](函数模板_2RkxMjKPgnjuMRxCQ882jV.md "函数模板")编程：

```c++
template <typename T>
class smart_ptr {
public:
  explicit smart_ptr(T* ptr = nullptr)
    : ptr_(ptr) {}
  ~smart_ptr()
  {
    delete ptr_;
  }
  T* get() const { return ptr_; }
private:
  T* ptr_;
};
```

目前这个 smart\_ptr 的行为还是和指针有点差异的：

- 它不能用`*` 运算符解引用
- 它不能用 `->` 运算符指向对象成员
- 它不能像指针一样用在布尔表达式里

这样的问题其实也好解决，在里面加入成员函数并且把这些符号重载

```c++
template <typename T>
class smart_ptr {
public:
  …
  T& operator*() const { return *ptr_; }
  T* operator->() const { return ptr_; }
  operator bool() const { return ptr_; }
}
```

## 拷贝构造和赋值

拷贝构造和赋值，我们暂且简称为拷贝，这是个比较复杂的问题了。关键还不是实现问题，而是我们该如何定义其行为。假设有下面的代码：

```c++
smart_ptr<shape> ptr1{create_shape(shape_type::circle)};
smart_ptr<shape> ptr2{ptr1};
```

对于第二行，究竟应当让编译时发生错误，还是可以有一个更合理的行为？我们来逐一检查一下各种可能性。
最简单的情况显然是禁止拷贝。我们可以使用下面的代码：

```c++
template <typename T>
class smart_ptr {
  …
  smart_ptr(const smart_ptr&)//重载拷贝构造函数
    = delete;
  smart_ptr& operator=(const smart_ptr&) //重载等号运算符
    = delete;
  …
};
```

禁用这两个函数非常简单，但却解决了一种可能出错的情况。否则，`smart_ptr<shape>ptr2{ptr1};` 在编译时不会出错，但在运行时却会有未定义行为——由于会对同一内存释放两次，通常情况下会导致程序崩溃。

我们是不是可以考虑在拷贝智能指针时把对象拷贝一份？不行，通常人们不会这么用，因为使用智能指针的目的就是要减少对象的拷贝啊。何况，虽然我们的指针类型是 shape，但实际指向的却应该是 circle 或 triangle 之类的对象。在 C++ 里没有像 Java 的clone 方法这样的约定；一般而言，并没有通用的方法可以通过基类的指针来构造出一个子类的对象来。
我们要么试试在拷贝时转移指针的所有权？大致实现如下：

```c++
template <typename T>
class smart_ptr {
  …
  smart_ptr(smart_ptr& other)//拷贝操作
  {
    ptr_ = other.release();
  }
  smart_ptr& operator=(smart_ptr& rhs)
  {
    smart_ptr(rhs).swap(*this); //调用swap函数
    return *this;
  }
  …
  T* release()
  {
    T* ptr = ptr_;
    ptr_ = nullptr;
    return ptr;
  }
  void swap(smart_ptr& rhs)
  {
    using std::swap;
    swap(ptr_, rhs.ptr_);//交换指针所有权
  }
  …
};

```

在拷贝构造函数中，通过调用 `other` 的 `release` 方法来释放它对指针的所有权。在赋值函数中，则通过拷贝构造产生一个临时对象并调用 swap 来交换对指针的所有权。实现上是不复杂的。
如果你学到的赋值函数还有一个类似于 `if (this != &rhs)` 的判断的话，那种用法更啰嗦，而且异常安全性不够好——如果在赋值过程中发生异常的话，this 对象的内容可能已经被部分破坏了，对象不再处于一个完整的状态。

目前这种惯用法（见参考资料[^1]）则保证了强异常安全性：赋值分为拷贝构造和交换两步，异常只可能在第一步发生；而第一步如果发生异常的话，this 对象完全不受任何影响。无论拷贝构造成功与否，结果只有赋值成功和赋值没有效果两种状态，而不会发生因为赋值破坏了当前对象这种场景

上面实现的最大问题是，它的行为会让程序员非常容易犯错。一不小心把它传递给另外一个`smart_ptr`，你就不再拥有这个对象了……

## 移动指针

smart\_ptr 可以如何使用“移动”来改善其行为。
我们需要对代码做两处小修改：

```c++
template <typename T>
class smart_ptr {
  …
  smart_ptr(smart_ptr&& other)
  {
    ptr_ = other.release();
  }
  smart_ptr& operator=(smart_ptr rhs)
  {
    rhs.swap(*this);
    return *this;
  }
…
};
```

- 把拷贝构造函数中的参数类型 `smart_ptr&` 改成了 `smart_ptr&&`；现在它成了移动构造函数（why？）。
- 把赋值函数中的参数类型 `smart_ptr& `改成了 `smart_ptr`，在构造参数时直接生成新的智能指针，从而不再需要在函数体中构造临时对象。现在赋值函数的行为是移动还是拷贝，完全依赖于构造参数时走的是移动构造还是拷贝构造。

根据 C++ 的规则，如果我提供了移动构造函数而没有手动提供拷贝构造函数，那后者自动被禁用（记住，C++ 里那些复杂的规则也是为方便编程而设立的）。于是，我们自然地得到了以下结果：

```c++
smart_ptr<shape> ptr1{create_shape(shape_type::circle)};
smart_ptr<shape> ptr2{ptr1}; // 编译出错
smart_ptr<shape> ptr3;
ptr3 = ptr1; // 编译出错
ptr3 = std::move(ptr1); // OK，可以
smart_ptr<shape> ptr4{std::move(ptr3)}; // OK，可以

```

这也是 C++11 的 `unique_ptr` 的基本行为。

## 子类指针向基类指针的转换

对，上一篇我们的例子里面出现了用基类指针指向子类,其实子类的指针`circle*`是可以隐式转换到`shape*`:又子类指针转换成父类指针，但是看上面我们定义的智能指针确是不行的。

所以还是用模板编程去解决这个问题：

```c++
template <typename U>
smart_ptr(smart_ptr<U>&& other)
{
  ptr_ = other.release();//更改指针指向方向实现平滑的移动
}
```

这样，我们自然而然利用了指针的转换特性：现在 `smart_ptr<circle> `可以移动给`smart_ptr<shape>`，但不能移动给 `smart_ptr<triangle>`。不正确的转换会在代码编译时直接报错。

非隐式转换在后面再进行讨论

## 引用计数

`unique_ptr` 算是一种较为安全的智能指针了。但是，一个对象只能被单个 `unique_ptr`所拥有，这显然不能满足所有使用场合的需求。一种常见的情况是，多个智能指针同时拥有一个对象；当它们全部都失效时，这个对象也同时会被删除。这也就是 `shared_ptr`了。
`unique_ptr` 和 `shared_ptr` 的主要区别如下图所示：

![](/images/imported/w-ktny/image_mt407J-UN-.png)

这种方案的内存管理其实有点类似于linux系统中对于文件的管理方式，链接的本质也是指针，如果是通过硬链接实现对文件的引用，在删除某一个文件的时候也需要查看计数，如果计数值归零才真正删除掉

多个不同的 `shared_ptr` 不仅可以共享一个对象，在共享同一对象时也需要同时共享同一个计数。当最后一个指向对象（和共享计数）的`shared_ptr`析构时，它需要删除对象和共享计数。我们下面就来实现一下。

```c++
class shared_count {
public:
  shared_count();
  void add_count();
  long reduce_count();
  long get_count() const;
};
```

这个 `shared_count` 类除构造函数之外有三个方法：一个增加计数，一个减少计数，一个获取计数。注意上面的接口增加计数不需要返回计数值；但减少计数时需要返回计数值，以供调用者判断是否它已经是最后一个指向共享计数的 shared\_ptr 了。由于真正多线程安全的版本需要用到我们目前还没学到的知识，我们目前先实现一个简单化的版本：

```c++
class shared_count {
public:
  shared_count() : count_(1) {}
  void add_count()
  {
    ++count_;
  }
  long reduce_count()
  {
    return --count_;
  }
  long get_count() const
  {
    return count_;
  }
private:
  long count_;
};
```

现在我们可以实现我们的引用计数智能指针了。首先是构造函数、析构函数和私有成员变量

[^1]: [https://stackoverflow.com/questions/3279543/what-is-the-copy-and-swap-idiom/3279550#3279550](https://stackoverflow.com/questions/3279543/what-is-the-copy-and-swap-idiom/3279550#3279550 "https://stackoverflow.com/questions/3279543/what-is-the-copy-and-swap-idiom/3279550#3279550")

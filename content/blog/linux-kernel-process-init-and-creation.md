---
title: "Linux 内核中的进程初始化与创建"
date: 2026-03-06T10:40:00+08:00
description: "从调度器和 task_struct 出发，梳理 Linux 早期内核中的进程初始化、创建与状态组织方式。"
categories: ["Linux系统", "系统原理"]
tags: ["Linux", "内核", "进程管理", "调度器"]
---

这篇文章和已经整理过的“进程销毁流程”可以视为前后篇：前者关注一个进程如何退出，这篇则聚焦进程是如何被组织、初始化并进入调度体系的。

## 如何创建一个新的进程

### 进程调度

进程调度的核心思路是：遍历 `task_struct[]` 任务数组，找出时间片最大的可运行进程并切换过去执行；当时间片耗尽后，再进入下一轮调度。

```c
void schedule(void)
{
  int i,next,c;
  struct task_struct ** p;

/* check alarm, wake up any interruptible tasks that have got a signal */

    // 从任务数组中最后一个任务开始循环检测alarm。在循环时跳过空指针项。
  for(p = &LAST_TASK ; p > &FIRST_TASK ; --p)
    if (*p) {
            // 如果设置过任务的定时值alarm，并且已经过期(alarm<jiffies)，则在
            // 信号位图中置SIGALRM信号，即向任务发送SIGALARM信号。然后清alarm。
            // 该信号的默认操作是终止进程。jiffies是系统从开机开始算起的滴答数(10ms/滴答)。
      if ((*p)->alarm && (*p)->alarm < jiffies) {
          (*p)->signal |= (1<<(SIGALRM-1));
          (*p)->alarm = 0;
        }
            // 如果信号位图中除被阻塞的信号外还有其他信号，并且任务处于可中断状态，则
            // 置任务为就绪状态。其中'~(_BLOCKABLE & (*p)->blocked)'用于忽略被阻塞的信号，但
            // SIGKILL 和SIGSTOP不能呗阻塞。
      if (((*p)->signal & ~(_BLOCKABLE & (*p)->blocked)) &&
      (*p)->state==TASK_INTERRUPTIBLE)
        (*p)->state=TASK_RUNNING;
    }

/* this is the scheduler proper: */

  while (1) {
    c = -1;
    next = 0;
    i = NR_TASKS;
    p = &task[NR_TASKS];
        // 这段代码也是从任务数组的最后一个任务开始循环处理，并跳过不含任务的数组槽。比较
        // 每个就绪状态任务的counter(任务运行时间的递减滴答计数)值，哪一个值大，运行时间还
        // 不长，next就值向哪个的任务号。
    while (--i) {
      if (!*--p)
        continue;
      if ((*p)->state == TASK_RUNNING && (*p)->counter > c)
        c = (*p)->counter, next = i;
    }
        // 如果比较得出有counter值不等于0的结果，或者系统中没有一个可运行的任务存在(此时c
        // 仍然为-1，next=0),则退出while(1)_的循环，执行switch任务切换操作。否则就根据每个
        // 任务的优先权值，更新每一个任务的counter值，然后回到while(1)循环。counter值的计算
        // 方式counter＝counter/2 + priority.注意：这里计算过程不考虑进程的状态。
    if (c) break;
    for(p = &LAST_TASK ; p > &FIRST_TASK ; --p)
      if (*p)
        (*p)->counter = ((*p)->counter >> 1) +
            (*p)->priority;
  }
    // 用下面的宏把当前任务指针current指向任务号Next的任务，并切换到该任务中运行。上面Next
    // 被初始化为0。此时任务0仅执行pause()系统调用，并又会调用本函数。
  switch_to(next);     // 切换到Next任务并运行。
}
```

这里只先聚焦进程创建和调度本身。进程退出、进程间通信等主题，可以拆到后续单独分析。

## 进程状态

```c
struct task_struct {
/* these are hardcoded - don't touch */
  long state;  /* -1 unrunnable, 0 runnable, >0 stopped */
  long counter;//counter计算的时候和优先级有很大的关系
  long priority;
  long signal;
  struct sigaction sigaction[32];
  long blocked;  /* bitmap of masked signals */
/* various fields */
  int exit_code;
  unsigned long start_code,end_code,end_data,brk,start_stack;
  long pid,father,pgrp,session,leader;
  unsigned short uid,euid,suid;
  unsigned short gid,egid,sgid;
  long alarm;
  long utime,stime,cutime,cstime,start_time;
  unsigned short used_math;
/* file system info */
  int tty;    /* -1 if no tty, so it must be signed */
  unsigned short umask;
  struct m_inode * pwd;
  struct m_inode * root;
  struct m_inode * executable;
  unsigned long close_on_exec;
  struct file * filp[NR_OPEN];
/* ldt for this task 0 - zero 1 - cs 2 - ds&ss */
  struct desc_struct ldt[3];
/* tss for this task */
  struct tss_struct tss;
};
```

`task_struct` 中定义了进程的大部分运行时状态。

![](/images/imported/w-ktny/image_Dh8Xfjef-j.png)

```c
struct tss_struct {
  long  back_link;  /* 16 high bits zero */
  long  esp0;
  long  ss0;    /* 16 high bits zero */
  long  esp1;
  long  ss1;    /* 16 high bits zero */
  long  esp2;
  long  ss2;    /* 16 high bits zero */
  long  cr3;
  long  eip;
  long  eflags;
  long  eax,ecx,edx,ebx;//都是一些寄存器
  long  esp;
  long  ebp;
  long  esi;
  long  edi;
  long  es;    /* 16 high bits zero */
  long  cs;    /* 16 high bits zero */
  long  ss;    /* 16 high bits zero */
  long  ds;    /* 16 high bits zero */
  long  fs;    /* 16 high bits zero */
  long  gs;    /* 16 high bits zero */
  long  ldt;    /* 16 high bits zero */
  long  trace_bitmap;  /* bits: trace 0, bitmap 16-31 */
  struct i387_struct i387;
};
```

可以把 `tss_struct` 理解为“进程切换时保存 CPU 现场的一部分关键结构”，它让调度器能够在不同进程之间恢复执行上下文。

## 进程的初始化（创建0号进程）

在linux启动的时候，运行main.c的时候会创建0号进程：

```c
    // 以下是内核进行所有方面的初始化工作。阅读时最好跟着调用的程序深入进去看，若实在
    // 看不下去了，就先放一放，继续看下一个初始化调用。——这是经验之谈。o(∩_∩)o 。;-)
  mem_init(main_memory_start,memory_end); // 主内存区初始化。mm/memory.c
  trap_init();                            // 陷阱门(硬件中断向量)初始化，kernel/traps.c
  blk_dev_init();                         // 块设备初始化,kernel/blk_drv/ll_rw_blk.c
  chr_dev_init();                         // 字符设备初始化, kernel/chr_drv/tty_io.c
  tty_init();                             // tty初始化， kernel/chr_drv/tty_io.c
  time_init();                            // 设置开机启动时间 startup_time
   sched_init();                           // 调度程序初始化(加载任务0的tr,ldtr)(kernel/sched.c)
    // 缓冲管理初始化，建内存链表等。(fs/buffer.c)
  buffer_init(buffer_memory_end);
  hd_init();                              // 硬盘初始化，kernel/blk_drv/hd.c
  floppy_init();                          // 软驱初始化，kernel/blk_drv/floppy.c
  sti();                                  // 所有初始化工作都做完了，开启中断
    // 下面过程通过在堆栈中设置的参数，利用中断返回指令启动任务0执行。
  move_to_user_mode();                    // 移到用户模式下执行
  if (!fork()) {    /* we count on this going ok */ //创建0进程
    init();                             // 在新建的子进程(任务1)中执行。
  }
```

```c
void sched_init(void)
{
  int i;
  struct desc_struct * p;                 // 描述符表结构指针

    // Linux系统开发之初，内核不成熟。内核代码会被经常修改。Linus怕自己无意中修改了
    // 这些关键性的数据结构，造成与POSIX标准的不兼容。这里加入下面这个判断语句并无
    // 必要，纯粹是为了提醒自己以及其他修改内核代码的人。
  if (sizeof(struct sigaction) != 16)         // sigaction 是存放有关信号状态的结构
    panic("Struct sigaction MUST be 16 bytes");
    // 在全局描述符表中设置初始任务(任务0)的任务状态段描述符和局部数据表描述符。
    // FIRST_TSS_ENTRY和FIRST_LDT_ENTRY的值分别是4和5，定义在include/linux/sched.h
    // 中；gdt是一个描述符表数组(include/linux/head.h)，实际上对应程序head.s中
    // 全局描述符表基址（_gdt）.因此gtd+FIRST_TSS_ENTRY即为gdt[FIRST_TSS_ENTRY](即为gdt[4]),
    // 也即gdt数组第4项的地址。
  set_tss_desc(gdt+FIRST_TSS_ENTRY,&(init_task.task.tss));//设置两个段
  set_ldt_desc(gdt+FIRST_LDT_ENTRY,&(init_task.task.ldt));
    // 清任务数组和描述符表项(注意 i=1 开始，所以初始任务的描述符还在)。描述符项结构
    // 定义在文件include/linux/head.h中。
  p = gdt+2+FIRST_TSS_ENTRY;
  for(i=1;i<NR_TASKS;i++) { //
    task[i] = NULL; // 清空task链表
    p->a=p->b=0;
    p++;
    p->a=p->b=0;
    p++;
  }
  /* Clear NT, so that we won't have troubles with that later on */
    // NT标志用于控制程序的递归调用(Nested Task)。当NT置位时，那么当前中断任务执行
    // iret指令时就会引起任务切换。NT指出TSS中的back_link字段是否有效。
  __asm__("pushfl ; andl $0xffffbfff,(%esp) ; popfl");        // 复位NT标志
  ltr(0);
  lldt(0);
    // 下面代码用于初始化8253定时器。通道0，选择工作方式3，二进制计数方式。通道0的
    // 输出引脚接在中断控制主芯片的IRQ0上，它每10毫秒发出一个IRQ0请求。LATCH是初始
    // 定时计数值。
  outb_p(0x36,0x43);    /* binary, mode 3, LSB/MSB, ch 0 */
  outb_p(LATCH & 0xff , 0x40);  /* LSB */
  outb(LATCH >> 8 , 0x40);  /* MSB */
    // 设置时钟中断处理程序句柄(设置时钟中断门)。修改中断控制器屏蔽码，允许时钟中断。
    // 然后设置系统调用中断门。这两个设置中断描述符表IDT中描述符在宏定义在文件
    // include/asm/system.h中。
  set_intr_gate(0x20,&timer_interrupt);
  outb(inb_p(0x21)&~0x01,0x21);
  set_system_gate(0x80,&system_call);
}

```

关于gdt全局描述符可见：[全局描述符表](https://zhuanlan.zhihu.com/p/25867829 "全局描述符表") gdt中有指针指向进程

linux在内核态不能进行进程切换（不可抢占）

```c++
void init(void)
{
  int pid,i;

    // setup()是一个系统调用。用于读取硬盘参数包括分区表信息并加载虚拟盘(若存在的话)
    // 和安装根文件系统设备。该函数用25行上的宏定义，对应函数是sys_setup()，在块设备
    // 子目录kernel/blk_drv/hd.c中。
  setup((void *) &drive_info);        // drive_info结构是2个硬盘参数表
    // 下面以读写访问方式打开设备"/dev/tty0",它对应终端控制台。由于这是第一次打开文件
    // 操作，因此产生的文件句柄号(文件描述符)肯定是0。该句柄是UNIX类操作系统默认的
    // 控制台标准输入句柄stdin。这里再把它以读和写的方式别人打开是为了复制产生标准输出(写)
    // 句柄stdout和标准出错输出句柄stderr。函数前面的"(void)"前缀用于表示强制函数无需返回值。
  (void) open("/dev/tty0",O_RDWR,0); //打开标准输入控制台
  (void) dup(0);                      // 复制句柄，产生句柄1号——stdout标准输出设备
  (void) dup(0);                      // 复制句柄，产生句柄2号——stderr标准出错输出设备
    // 打印缓冲区块数和总字节数，每块1024字节，以及主内存区空闲内存字节数
  printf("%d buffers = %d bytes buffer space\n\r",NR_BUFFERS,
    NR_BUFFERS*BLOCK_SIZE);
  printf("Free mem: %d bytes\n\r",memory_end-main_memory_start);
    // 下面fork()用于创建一个子进程(任务2)。对于被创建的子进程，fork()将返回0值，对于
    // 原进程(父进程)则返回子进程的进程号pid。该子进程关闭了句柄0(stdin)、以只读方式打开
    // /etc/rc文件，并使用execve()函数将进程自身替换成/bin/sh程序(即shell程序)，然后
    // 执行/bin/sh程序。然后执行/bin/sh程序。所携带的参数和环境变量分别由argv_rc和envp_rc
    // 数组给出。关闭句柄0并立即打开/etc/rc文件的作用是把标准输入stdin重定向到/etc/rc文件。
    // 这样shell程序/bin/sh就可以运行rc文件中的命令。由于这里的sh的运行方式是非交互的，
    // 因此在执行完rc命令后就会立刻退出，进程2也随之结束。
    // _exit()退出时出错码1 - 操作未许可；2 - 文件或目录不存在。
  if (!(pid=fork())) { //创建一号进程
    close(0);
    if (open("/etc/rc",O_RDONLY,0))
      _exit(1);                       // 如果打开文件失败，则退出(lib/_exit.c)
    execve("/bin/sh",argv_rc,envp_rc);  // 替换成/bin/sh程序并执行
    _exit(2);                           // 若execve()执行失败则退出。
  }
    // 下面还是父进程(1)执行语句。wait()等待子进程停止或终止，返回值应是子进程的进程号(pid).
    // 这三句的作用是父进程等待子进程的结束。&i是存放返回状态信息的位置。如果wait()返回值
    // 不等于子进程号，则继续等待。
  if (pid>0)
    while (pid != wait(&i))
      /* nothing */;
    // 如果执行到这里，说明刚创建的子进程的执行已停止或终止了。下面循环中首先再创建
    // 一个子进程，如果出错，则显示“初始化程序创建子进程失败”信息并继续执行。对于所
    // 创建的子进程将关闭所有以前还遗留的句柄(stdin, stdout, stderr),新创建一个会话
    // 并设置进程组号，然后重新打开/dev/tty0作为stdin,并复制成stdout和sdterr.再次
    // 执行系统解释程序/bin/sh。但这次执行所选用的参数和环境数组另选了一套。然后父
    // 进程再次运行wait()等待。如果子进程又停止了执行，则在标准输出上显示出错信息
    // “子进程pid挺直了运行，返回码是i”,然后继续重试下去....，形成一个“大”循环。
    // 此外，wait()的另外一个功能是处理孤儿进程。如果一个进程的父进程先终止了，那么
    // 这个进程的父进程就会被设置为这里的init进程(进程1)，并由init进程负责释放一个
    // 已终止进程的任务数据结构等资源。
  while (1) {
    if ((pid=fork())<0) { //继续创建进程
      printf("Fork failed in init\r\n");
      continue;
    }
    if (!pid) {                                 // 新的子进程
      close(0);close(1);close(2);
      setsid();                               // 创建一新的会话期
      (void) open("/dev/tty0",O_RDWR,0);
      (void) dup(0);
      (void) dup(0);
      _exit(execve("/bin/sh",argv,envp));
    }
    while (1)
      if (pid == wait(&i))
        break;
    printf("\n\rchild %d died with code %04x\n\r",pid,i);
    sync();                                     // 同步操作，刷新缓冲区。
  }
    // _exit()和exit()都用于正常终止一个函数。但_exit()直接是一个sys_exit系统调用，
    // 而exit()则通常是普通函数库中的一个函数。它会先执行一些清除操作，例如调用
    // 执行各终止处理程序、关闭所有标准IO等，然后调用sys_exit。
  _exit(0);  /* NOTE! _exit, not exit() */
}
```

在0号进程中：

- 打开标准输入输出
- 创建1号进程：
  - 打开"etc/rc"文件
  - 执行shell程序"bin/sh"
- 0号进程不可能结束，会在没有其他进程调用的时候被调用，只会执行`for(;;)pause();` 循环且暂停（挂起）

## 进程的创建

`fork()`

- 在task中找一个空位存放当前进程
- 创建一个task\_struct
- 设置task\_struct

这个task\_struct使用c语言中结构体实现了oop

进程的创建的本质就是一个系统调用

```c
/*
 *  linux/kernel/fork.c
 *
 *  (C) 1991  Linus Torvalds
 */

/*
 *  'fork.c' contains the help-routines for the 'fork' system call
 * (see also system_call.s), and some misc functions ('verify_area').
 * Fork is rather simple, once you get the hang of it, but the memory
 * management can be a bitch. See 'mm/mm.c': 'copy_page_tables()'
 */
#include <errno.h>

#include <linux/sched.h>
#include <linux/kernel.h>
#include <asm/segment.h>
#include <asm/system.h>

// 写页面验证。若页面不可写，则复制页面。
extern void write_verify(unsigned long address);

long last_pid=0;    // 最新进程号，其值会由get_empty_process生成。

// 进程空间区域写前验证函数
// 对于80386 CPU，在执行特权级0代码时不会理会用户空间中的页面是否是也保护的，
// 因此在执行内核代码时用户空间中数据页面来保护标志起不了作用，写时复制机制
// 也就失去了作用。verify_area()函数就用于此目的。但对于80486或后来的CPU，其
// 控制寄存器CRO中有一个写保护标志WP(位16)，内核可以通过设置该标志来禁止特权
// 级0的代码向用户空间只读页面执行写数据，否则将导致发生写保护异常。从而486
// 以上CPU可以通过设置该标志来达到本函数的目的。
// 该函数对当前进程逻辑地址从addr到addr+size这一段范围以页为单位执行写操作前
// 的检测操作。由于检测判断是以页面为单位进行操作，因此程序首先需要找出addr所
// 在页面开始地址start，然后start加上进程数据段基址，使这个start变成CPU 4G线性
// 空间中的地址。最后循环调用write_verify()对指定大小的内存空间进行写前验证。
// 若页面是只读的，则执行共享检验和复制页面操作。
void verify_area(void * addr,int size)
{
  unsigned long start;

    // 首先将起始地址start调整为其所在左边界开始位置，同时相应地调整验证区域
    // 大小。下句中的start& 0xfff 用来获得指定起始位置addr(也即start)在所在
    // 页面中的偏移值，原验证范围size加上这个偏移值即扩展成以addr所在页面起始
    // 位置开始的范围值。因此在下面也需要把验证开始位置start调整成页面边界值。
  start = (unsigned long) addr;
  size += start & 0xfff;
  start &= 0xfffff000;            // 此时start是当前进程空间中的逻辑地址。
    // 下面start加上进程数据段在线性地址空间中的起始基址，变成系统整个线性空间
    // 中的地址位置。对于linux-0.11内核，其数据段和代码在线性地址空间中的基址
    // 和限长均相同。
  start += get_base(current->ldt[2]);
  while (size>0) {
    size -= 4096;
    write_verify(start);
    start += 4096;
  }
}

// 复制内存页表
// 参数nr是新任务号：p是新任务数据结构指针。该函数为新任务在线性地址空间中
// 设置代码段和数据段基址、限长，并复制页表。由于Linux系统采用了写时复制
// (copy on write)技术，因此这里仅为新进程设置自己的页目录表项和页表项，而
// 没有实际为新进程分配物理内存页面。此时新进程与其父进程共享所有内存页面。
// 操作成功返回0，否则返回出错号。
int copy_mem(int nr,struct task_struct * p)
{
  unsigned long old_data_base,new_data_base,data_limit;
  unsigned long old_code_base,new_code_base,code_limit;

    // 首先取当前进程局部描述符表中代表中代码段描述符和数据段描述符项中的
    // 的段限长(字节数)。0x0f是代码段选择符：0x17是数据段选择符。然后取
    // 当前进程代码段和数据段在线性地址空间中的基地址。由于Linux-0.11内核
    // 还不支持代码和数据段分立的情况，因此这里需要检查代码段和数据段基址
    // 和限长是否都分别相同。否则内核显示出错信息，并停止运行。
  code_limit=get_limit(0x0f);
  data_limit=get_limit(0x17);
  old_code_base = get_base(current->ldt[1]);
  old_data_base = get_base(current->ldt[2]);
  if (old_data_base != old_code_base)
    panic("We don't support separate I&D");
  if (data_limit < code_limit)
    panic("Bad data_limit");
    // 然后设置创建中的新进程在线性地址空间中的基地址等于(64MB * 其任务号)，
    // 并用该值设置新进程局部描述符表中段描述符中的基地址。接着设置新进程
    // 的页目录表项和页表项，即复制当前进程(父进程)的页目录表项和页表项。
    // 此时子进程共享父进程的内存页面。正常情况下copy_page_tables()返回0，
    // 否则表示出错，则释放刚申请的页表项。
  new_data_base = new_code_base = nr * 0x4000000;
  p->start_code = new_code_base;
  set_base(p->ldt[1],new_code_base);
  set_base(p->ldt[2],new_data_base);
  if (copy_page_tables(old_data_base,new_data_base,data_limit)) {
    printk("free_page_tables: from copy_mem\n");
    free_page_tables(new_data_base,data_limit);
    return -ENOMEM;
  }
  return 0;
}

/*
 *  Ok, this is the main fork-routine. It copies the system process
 * information (task[nr]) and sets up the necessary registers. It
 * also copies the data segment in it's entirety.
 */
// 复制进程
// 该函数的参数进入系统调用中断处理过程开始，直到调用本系统调用处理过程
// 和调用本函数前时逐步压入栈的各寄存器的值。这些在system_call.s程序中
// 逐步压入栈的值(参数)包括：
// 1. CPU执行中断指令压入的用户栈地址ss和esp,标志寄存器eflags和返回地址cs和eip;
// 2. 在刚进入system_call时压入栈的段寄存器ds、es、fs和edx、ecx、ebx；
// 3. 调用sys_call_table中sys_fork函数时压入栈的返回地址(用参数none表示)；
// 4. 在调用copy_process()分配任务数组项号。
int copy_process(int nr,long ebp,long edi,long esi,long gs,long none,
    long ebx,long ecx,long edx,
    long fs,long es,long ds,
    long eip,long cs,long eflags,long esp,long ss)
{
  struct task_struct *p;
  int i;
  struct file *f;

    // 首先为新任务数据结构分配内存。如果内存分配出错，则返回出错码并退出。
    // 然后将新任务结构指针放入任务数组的nr项中。其中nr为任务号，由前面
    // find_empty_process()返回。接着把当前进程任务结构内容复制到刚申请到
    // 的内存页面p开始处。
  p = (struct task_struct *) get_free_page();
  if (!p)
    return -EAGAIN;
  task[nr] = p;
  *p = *current;  /* NOTE! this doesn't copy the supervisor stack */
    // 随后对复制来的进程结构内容进行一些修改，作为新进程的任务结构。先将
    // 进程的状态置为不可中断等待状态，以防止内核调度其执行。然后设置新进程
    // 的进程号pid和父进程号father，并初始化进程运行时间片值等于其priority值
    // 接着复位新进程的信号位图、报警定时值、会话(session)领导标志leader、进程
    // 及其子进程在内核和用户态运行时间统计值，还设置进程开始运行的系统时间start_time.
  p->state = TASK_UNINTERRUPTIBLE;
  p->pid = last_pid;              // 新进程号。也由find_empty_process()得到。
  p->father = current->pid;       // 设置父进程
  p->counter = p->priority;       // 运行时间片值
  p->signal = 0;                  // 信号位图置0
  p->alarm = 0;                   // 报警定时值(滴答数)
  p->leader = 0;    /* process leadership doesn't inherit */
  p->utime = p->stime = 0;        // 用户态时间和和心态运行时间
  p->cutime = p->cstime = 0;      // 子进程用户态和和心态运行时间
  p->start_time = jiffies;        // 进程开始运行时间(当前时间滴答数)
    // 再修改任务状态段TSS数据，由于系统给任务结构p分配了1页新内存，所以(PAGE_SIZE+
    // (long)p)让esp0正好指向该页顶端。ss0:esp0用作程序在内核态执行时的栈。另外，
    // 每个任务在GDT表中都有两个段描述符，一个是任务的TSS段描述符，另一个是任务的LDT
    // 表描述符。下面语句就是把GDT中本任务LDT段描述符和选择符保存在本任务的TSS段中。
    // 当CPU执行切换任务时，会自动从TSS中把LDT段描述符的选择符加载到ldtr寄存器中。
  p->tss.back_link = 0;
  p->tss.esp0 = PAGE_SIZE + (long) p;     // 任务内核态栈指针。
  p->tss.ss0 = 0x10;                      // 内核态栈的段选择符(与内核数据段相同)
  p->tss.eip = eip;                       // 指令代码指针
  p->tss.eflags = eflags;                 // 标志寄存器
  p->tss.eax = 0;                         // 这是当fork()返回时新进程会返回0的原因所在
  p->tss.ecx = ecx;
  p->tss.edx = edx;
  p->tss.ebx = ebx;
  p->tss.esp = esp;
  p->tss.ebp = ebp;
  p->tss.esi = esi;
  p->tss.edi = edi;
  p->tss.es = es & 0xffff;                // 段寄存器仅16位有效
  p->tss.cs = cs & 0xffff;
  p->tss.ss = ss & 0xffff;
  p->tss.ds = ds & 0xffff;
  p->tss.fs = fs & 0xffff;
  p->tss.gs = gs & 0xffff;
  p->tss.ldt = _LDT(nr);                  // 任务局部表描述符的选择符(LDT描述符在GDT中)
  p->tss.trace_bitmap = 0x80000000;       // 高16位有效
    // 如果当前任务使用了协处理器，就保存其上下文。汇编指令clts用于清除控制寄存器CRO中
    // 的任务已交换(TS)标志。每当发生任务切换，CPU都会设置该标志。该标志用于管理数学协
    // 处理器：如果该标志置位，那么每个ESC指令都会被捕获(异常7)。如果协处理器存在标志MP
    // 也同时置位的话，那么WAIT指令也会捕获。因此，如果任务切换发生在一个ESC指令开始执行
    // 之后，则协处理器中的内容就可能需要在执行新的ESC指令之前保存起来。捕获处理句柄会
    // 保存协处理器的内容并复位TS标志。指令fnsave用于把协处理器的所有状态保存到目的操作数
    // 指定的内存区域中。
  if (last_task_used_math == current)
    __asm__("clts ; fnsave %0"::"m" (p->tss.i387));
    // 接下来复制进程页表。即在线性地址空间中设置新任务代码段和数据段描述符中的基址和限长，
    // 并复制页表。如果出错(返回值不是0)，则复位任务数组中相应项并释放为该新任务分配的用于
    // 任务结构的内存页。
  if (copy_mem(nr,p)) {
    task[nr] = NULL;
    free_page((long) p);
    return -EAGAIN;
  }
    /*  如果父进程中有文件是打开的，则将对应文件的打开次数增1，因为这里创建的子进程会与父
       进程共享这些打开的文件。将当前进程(父进程)的pwd，root和executable引用次数均增1.
       与上面同样的道理，子进程也引用了这些i节点。
     */
  for (i=0; i<NR_OPEN;i++)
    if ((f=p->filp[i]))
      f->f_count++;
  if (current->pwd)
    current->pwd->i_count++;
  if (current->root)
    current->root->i_count++;
  if (current->executable)
    current->executable->i_count++;
    // 随后GDT表中设置新任务TSS段和LDT段描述符项。这两个段的限长均被设置成104字节。
    // set_tss_desc()和set_ldt_desc()在system.h中定义。"gdt+(nr<<1)+FIRST_TSS_ENTRY"是
    // 任务nr的TSS描述符项在全局表中的地址。因为每个任务占用GDT表中2项，因此上式中
    // 要包括'(nr<<1)'.程序然后把新进程设置成就绪态。另外在任务切换时，任务寄存器tr由
    // CPU自动加载。最后返回新进程号。
  set_tss_desc(gdt+(nr<<1)+FIRST_TSS_ENTRY,&(p->tss));
  set_ldt_desc(gdt+(nr<<1)+FIRST_LDT_ENTRY,&(p->ldt)); //设置两个段
  p->state = TASK_RUNNING;  /* do this last, just in case */ //标记程序为可运行状态
  return last_pid; // 返回新创建进程的pid
}

// 为新进程取得不重复的进程号last_pid.函数返回在任务数组中的任务号(数组项)。
int find_empty_process(void)
{
  int i;

    // 首先获取新的进程号。如果last_pid增1后超出进程号的整数表示范围，则重新从1开始
    // 使用pid号。然后在任务数组中搜索刚设置的pid号是否已经被任何任务使用。如果是则
    // 跳转到函数开始出重新获得一个pid号。接着在任务数组中为新任务寻找一个空闲项，并
    // 返回项号。last_pid是一个全局变量，不用返回。如果此时任务数组中64个项已经被全部
    // 占用，则返回出错码。
  repeat:
    if ((++last_pid)<0) last_pid=1;
    for(i=0 ; i<NR_TASKS ; i++)
      if (task[i] && task[i]->pid == last_pid) goto repeat;
  for(i=1 ; i<NR_TASKS ; i++)         // 任务0项被排除在外
    if (!task[i])
      return i;
  return -EAGAIN;
}
```

```nasm
### sys_fork()调用，用于创建子进程，是system_call功能2.
## 首先调用C函数find_empty_process()，取得一个进程号PID。若返回负数则说明目前任务数组
## 已满。然后调用copy_process()复制进程。
.align 2
sys_fork:
  call find_empty_process
  testl %eax,%eax             # 在eax中返回进程号pid。若返回负数则退出。
  js 1f
  push %gs
  pushl %esi
  pushl %edi
  pushl %ebp
  pushl %eax
  call copy_process
  addl $20,%esp               # 丢弃这里所有压栈内容。
1:  ret

```

进程的创建就是对0号进程或者当前进程的复制，本质就是结构体的复制， 把task\[]对应的task\_struct复制给新的task\_struct

对于栈堆的拷贝 当进程创建的时候也拷贝原来的栈堆

将当前子进程放入进程链表中

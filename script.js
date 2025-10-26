// 作者: liu.tao

// DOM元素选择器
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const backToTopButton = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

// 移动端菜单切换
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // 切换图标
        const icon = menuToggle.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });
}

// 点击移动菜单链接后关闭菜单
const mobileLinks = mobileMenu?.querySelectorAll('a');
mobileLinks?.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// 回到顶部按钮
window.addEventListener('scroll', () => {
    if (backToTopButton) {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.add('opacity-0', 'invisible');
            backToTopButton.classList.remove('opacity-100', 'visible');
        }
    }
});

backToTopButton?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 表单提交处理
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 模拟表单提交
    setTimeout(() => {
        contactForm.reset();
        formSuccess.classList.remove('hidden');
        
        // 5秒后隐藏成功消息
        setTimeout(() => {
            formSuccess.classList.add('hidden');
        }, 5000);
    }, 800);
});

// 游戏卡片动画效果增强
const gameCards = document.querySelectorAll('.game-card-hover');
gameCards.forEach(card => {
    // 添加鼠标进入效果
    card.addEventListener('mouseenter', () => {
        // 为图标或特定元素添加额外动画
        const icon = card.querySelector('.game-icon, .fa, i');
        if (icon) {
            icon.classList.add('animate-bounce');
            setTimeout(() => {
                icon.classList.remove('animate-bounce');
            }, 1000);
        }
    });
});

// 数字计数动画（简单实现）
function animateCounter(elementId, target, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let startTime = null;
    const startValue = 0;
    
    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (target - startValue) + startValue);
        element.textContent = currentValue;
        
        if (progress < 1) {
            window.requestAnimationFrame(updateCounter);
        }
    }
    
    window.requestAnimationFrame(updateCounter);
}

// 当页面滚动到关于部分时触发数字动画
const aboutSection = document.getElementById('about');
let animationTriggered = false;

window.addEventListener('scroll', () => {
    if (!animationTriggered && aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            animateCounter('game-count', 8);
            animateCounter('feature-count', 3);
            animateCounter('difficulty-count', 3);
            animationTriggered = true;
        }
    }
});

// 添加页面加载动画效果
window.addEventListener('load', () => {
    // 添加页面元素的淡入效果
    document.body.classList.add('opacity-100');
    document.body.classList.remove('opacity-0');
    
    // 显示初始的数字（如果页面加载时关于部分已在视图中）
    if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0 && !animationTriggered) {
            animateCounter('game-count', 8);
            animateCounter('feature-count', 3);
            animateCounter('difficulty-count', 3);
            animationTriggered = true;
        }
    }
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 按下Esc键关闭移动菜单
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    
    // 按下Ctrl+↑回到顶部
    if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

// 响应式调整
window.addEventListener('resize', () => {
    // 在桌面模式下确保移动菜单关闭
    if (window.innerWidth >= 768 && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});
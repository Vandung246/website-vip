// Script cho trang chủ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Trang chủ đã tải xong!');
    
    // Xử lý click cho các box
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(function(box) {
        box.addEventListener('click', function() {
            console.log('Box được click:', box.textContent);
        });
    });
    
    // Xử lý click cho navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Navigation được xử lý bởi href, không cần preventDefault
            console.log('Bạn đã click vào:', link.textContent);
        });
    });
});

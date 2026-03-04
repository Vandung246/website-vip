// Kiểm tra đăng nhập cho các trang con
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
    }
}

// Hàm đăng xuất
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

// Kiểm tra khi trang tải
document.addEventListener('DOMContentLoaded', function() {
    // Chỉ kiểm tra nếu không phải trang đăng nhập
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && currentPage !== '') {
        checkAuth();
    }
});

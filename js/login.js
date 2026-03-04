// Kiểm tra nếu đã đăng nhập
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'trangchu.html';
    }
};

// Xử lý form đăng nhập
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    // Xóa thông báo lỗi cũ
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    // Kiểm tra dữ liệu
    if (username === '' || password === '') {
        showError('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    
    // Thông tin đăng nhập mặc định (có thể thay đổi)
    const defaultUsername = 'admin123';
    const defaultPassword = '12345';
    
    // Kiểm tra đăng nhập
    if (username === defaultUsername && password === defaultPassword) {
        // Lưu trạng thái đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Chuyển đến trang chủ
        window.location.href = 'trangchu.html';
    } else {
        showError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
});

// Hiển thị thông báo lỗi
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Chờ trang web tải xong
document.addEventListener('DOMContentLoaded', function() {
    console.log('Trang thống kê đã tải xong!');
    
    // Cập nhật thống kê
    updateStatistics();
    
    // Lắng nghe sự kiện storage để tự động cập nhật khi dữ liệu thay đổi (từ tab khác)
    window.addEventListener('storage', function(e) {
        if (e.key === 'khachhang' || e.key === 'dichvu') {
            updateStatistics();
        }
    });
    
    // Lắng nghe custom event để cập nhật khi dữ liệu thay đổi (trong cùng tab)
    window.addEventListener('dataUpdated', function(e) {
        updateStatistics();
    });
});

// Cập nhật thống kê
function updateStatistics() {
    try {
        // Load dữ liệu từ localStorage
        const customers = JSON.parse(localStorage.getItem('khachhang') || '[]');
        const services = JSON.parse(localStorage.getItem('dichvu') || '[]');
        
        // Tính toán thống kê cơ bản
        const totalCustomers = customers.length;
        const totalServices = services.length;
        
        // Tính tổng doanh thu (tổng giá của tất cả dịch vụ)
        let totalRevenue = 0;
        services.forEach(function(service) {
            totalRevenue += (parseFloat(service.gia) || 0);
        });
        
        // Đếm số dịch vụ đang hoạt động
        const activeServices = services.filter(s => s.trangthai === 'active').length;
        
        // Cập nhật UI cơ bản
        updateBasicStats(totalCustomers, totalServices, totalRevenue, activeServices);
        
        // Cập nhật thống kê chi tiết
        updateDetailedStats(customers, services);
        
        // Cập nhật top dịch vụ
        updateTopServices(services);
        
    } catch (error) {
        console.error('Lỗi khi cập nhật thống kê:', error);
    }
}

function updateBasicStats(totalCustomers, totalServices, totalRevenue, activeServices) {
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalServicesEl = document.getElementById('totalServices');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const activeServicesEl = document.getElementById('activeServices');
    
    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (totalServicesEl) totalServicesEl.textContent = totalServices;
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);
    if (activeServicesEl) activeServicesEl.textContent = activeServices;
}

function updateDetailedStats(customers, services) {
    // Thống kê giới tính
    const male = customers.filter(c => c.gioitinh === 'Nam').length;
    const female = customers.filter(c => c.gioitinh === 'Nữ').length;
    const other = customers.filter(c => c.gioitinh === 'Khác' || !c.gioitinh).length;
    
    document.getElementById('detailCustomers').textContent = customers.length;
    document.getElementById('detailMale').textContent = male;
    document.getElementById('detailFemale').textContent = female;
    document.getElementById('detailOther').textContent = other;
    
    // Thống kê dịch vụ
    const active = services.filter(s => s.trangthai === 'active').length;
    const inactive = services.filter(s => s.trangthai === 'inactive').length;
    
    // Tính giá trung bình
    let totalPrice = 0;
    services.forEach(s => {
        totalPrice += (parseFloat(s.gia) || 0);
    });
    const avgPrice = services.length > 0 ? totalPrice / services.length : 0;
    
    document.getElementById('detailServices').textContent = services.length;
    document.getElementById('detailActive').textContent = active;
    document.getElementById('detailInactive').textContent = inactive;
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
    
    // Cập nhật biểu đồ giới tính
    updateGenderStats(male, female, other);
    
    // Cập nhật biểu đồ trạng thái
    updateStatusStats(active, inactive);
}

function updateGenderStats(male, female, other) {
    const genderStats = document.getElementById('genderStats');
    if (!genderStats) return;
    
    const total = male + female + other;
    if (total === 0) {
        genderStats.innerHTML = '<p class="text-muted">Chưa có dữ liệu</p>';
        return;
    }
    
    genderStats.innerHTML = `
        <div class="progress mb-2" style="height: 25px;">
            <div class="progress-bar bg-primary" role="progressbar" style="width: ${(male/total)*100}%">
                Nam: ${male} (${((male/total)*100).toFixed(1)}%)
            </div>
            <div class="progress-bar bg-danger" role="progressbar" style="width: ${(female/total)*100}%">
                Nữ: ${female} (${((female/total)*100).toFixed(1)}%)
            </div>
            <div class="progress-bar bg-secondary" role="progressbar" style="width: ${(other/total)*100}%">
                Khác: ${other} (${((other/total)*100).toFixed(1)}%)
            </div>
        </div>
    `;
}

function updateStatusStats(active, inactive) {
    const statusStats = document.getElementById('statusStats');
    if (!statusStats) return;
    
    const total = active + inactive;
    if (total === 0) {
        statusStats.innerHTML = '<p class="text-muted">Chưa có dữ liệu</p>';
        return;
    }
    
    statusStats.innerHTML = `
        <div class="progress mb-2" style="height: 25px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${(active/total)*100}%">
                Đang hoạt động: ${active} (${((active/total)*100).toFixed(1)}%)
            </div>
            <div class="progress-bar bg-secondary" role="progressbar" style="width: ${(inactive/total)*100}%">
                Tạm dừng: ${inactive} (${((inactive/total)*100).toFixed(1)}%)
            </div>
        </div>
    `;
}

function updateTopServices(services) {
    const topServices = document.getElementById('topServices');
    if (!topServices) return;
    
    // Sắp xếp theo giá giảm dần và lấy top 5
    const sorted = [...services].sort((a, b) => (b.gia || 0) - (a.gia || 0)).slice(0, 5);
    
    if (sorted.length === 0) {
        topServices.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có dịch vụ nào</td></tr>';
        return;
    }
    
    let html = '';
    sorted.forEach((dv, i) => {
        const statusBadge = dv.trangthai === 'active' 
            ? '<span class="badge bg-success">✅ Đang hoạt động</span>'
            : '<span class="badge bg-secondary">⏸️ Tạm dừng</span>';
        
        html += `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${dv.ten}</strong></td>
            <td>${formatCurrency(dv.gia)}</td>
            <td>${statusBadge}</td>
        </tr>`;
    });
    
    topServices.innerHTML = html;
}

function exportReport() {
    const customers = JSON.parse(localStorage.getItem('khachhang') || '[]');
    const services = JSON.parse(localStorage.getItem('dichvu') || '[]');
    
    const report = {
        ngayBaoCao: new Date().toLocaleString('vi-VN'),
        tongKhachHang: customers.length,
        tongDichVu: services.length,
        tongDoanhThu: services.reduce((sum, s) => sum + (parseFloat(s.gia) || 0), 0),
        danhSachKhachHang: customers,
        danhSachDichVu: services
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Đã xuất báo cáo thành công!');
}

// Format tiền tệ
function formatCurrency(amount) {
    if (isNaN(amount) || amount === 0) {
        return '0 VNĐ';
    }
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
}

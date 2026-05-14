import React from 'react';
import styles from './Sidebar.module.scss';
import { Home, Calendar, BookOpen, Settings, Archive } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, isOpen }) => (
  <div className={`${styles.navItem} ${active ? styles.active : ''} ${!isOpen ? styles.collapsed : ''}`}>
    <Icon size={22} className={styles.icon} />
    {isOpen && <span>{label}</span>}
  </div>
);

const Sidebar = ({ isOpen }) => {
  const enrolledClasses = [
    { id: 1, name: 'Lập trình ReactJS' },
    { id: 2, name: 'UI/UX cơ bản' },
  ];

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.isClosed : ''}`}>
      <div className={styles.section}>
        <SidebarItem icon={Home} label="Trang chủ" active isOpen={isOpen} />
        <SidebarItem icon={Calendar} label="Lịch" isOpen={isOpen} />
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        {isOpen && <h4 className={styles.sectionTitle}>Đã đăng ký</h4>}
        {enrolledClasses.map(cls => (
          <SidebarItem key={cls.id} icon={BookOpen} label={cls.name} isOpen={isOpen} />
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <SidebarItem icon={Archive} label="Lớp học đã lưu trữ" isOpen={isOpen} />
        <SidebarItem icon={Settings} label="Cài đặt" isOpen={isOpen} />
      </div>
    </aside>
  );
};

export default Sidebar;
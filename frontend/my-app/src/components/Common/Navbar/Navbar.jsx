import React from 'react';
import styles from './Navbar.module.scss';
import { Menu, Plus, Bell, Grid, Search } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.iconBtn} onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>E</div>
          <span className={styles.logoText}>EduClass</span>
        </div>
      </div>

      <div className={styles.middle}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Tìm kiếm lớp học..." />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} title="Tạo hoặc tham gia lớp học">
          <Plus size={24} />
        </button>
        <button className={styles.iconBtn}>
          <Grid size={22} />
        </button>
        <button className={styles.iconBtn}>
          <Bell size={22} />
        </button>
        <div className={styles.profile}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
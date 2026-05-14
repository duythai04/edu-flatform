import React from 'react';
import styles from './ClassCard.module.scss';
import { MoreVertical, User } from 'lucide-react';

const ClassCard = ({ title, teacher, bannerColor }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header} style={{ backgroundColor: bannerColor }}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.moreBtn}><MoreVertical size={20} /></button>
        </div>
        <p className={styles.teacher}>{teacher}</p>
        <img 
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher}`} 
          className={styles.avatar} 
          alt="teacher" 
        />
      </div>
      <div className={styles.body}>
        {/* Nội dung bổ sung bài tập nếu có */}
      </div>
      <div className={styles.footer}>
         <div className={styles.studentCount}>
            <User size={14} /> <span>25 học viên</span>
         </div>
      </div>
    </div>
  );
};

export default ClassCard;
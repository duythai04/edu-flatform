import React from "react";
import ClassCard from "../../components/Common/ClassCard/ClassCard";
import styles from "./Home.module.scss";

const Home = () => {
  const myClasses = [
    {
      id: 1,
      title: "Lớp ReactJS K1",
      teacher: "Sơn Tùng M-TP",
      color: "#1967d2",
    },
    { id: 2, title: "UI/UX Design", teacher: "Hieuthuhai", color: "#007b83" },
    { id: 3, title: "NodeJS Backend", teacher: "Đen Vâu", color: "#5f6368" },
    { id: 4, title: "English For Devs", teacher: "Mono", color: "#d93025" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        <main className={styles.content}>
          <div className={styles.grid}>
            {myClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                title={cls.title}
                teacher={cls.teacher}
                bannerColor={cls.color}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

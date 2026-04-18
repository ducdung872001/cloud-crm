interface Props {
  ribbon: string;
  title: string;
  desc: string;
  icon: string;
  emptyTitle: string;
  emptyDesc: string;
}

export default function EmptyView({ ribbon, title, desc, icon, emptyTitle, emptyDesc }: Props) {
  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">{ribbon}</div>
          <h1 className="title">{title}</h1>
          <p className="desc">{desc}</p>
        </div>
      </div>
      <div className="empty">
        <div className="empty-ico">{icon}</div>
        <div className="empty-title">{emptyTitle}</div>
        <div className="empty-desc">{emptyDesc}</div>
      </div>
    </section>
  );
}

import { getUser } from "@/lib/auth";

export const metadata = { title: "Settings — WriteAI" };

export default async function Page() {
  const u = await getUser();
  return (
    <>
      <h1 className="page-title serif">Settings</h1>
      <div className="card" style={{ marginTop: 18, maxWidth: 520, display: "grid", gap: 10 }}>
        <div><span className="muted">Name</span><br /><b>{u.name}</b></div>
        <div><span className="muted">Email</span><br /><b>{u.email}</b></div>
        <div><span className="muted">Plan</span><br /><b style={{ textTransform: "capitalize" }}>{u.plan}</b></div>
        <div><span className="muted">Member since</span><br /><b>{new Date(u.createdAt).toLocaleDateString()}</b></div>
      </div>
    </>
  );
}

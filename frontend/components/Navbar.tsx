import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/"><b>YiriAI</b></Link>
      </div>
      <div className="nav-right">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/dashboard">Dashboard</Link>
        <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </nav>
  );
}

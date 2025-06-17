import Link from 'next/link'
import { useRouter } from 'next/router'

export function SidebarFolder({ title, route, children }: any) {
  const router = useRouter()
  
  return (
    <div>
      <Link href={route} style={{ 
        color: 'inherit', 
        textDecoration: 'none',
        display: 'block',
        padding: '0.25rem 0'
      }}>
        {title}
      </Link>
      {children}
    </div>
  )
}
// Menu configuratie voor verschillende user roles
export interface MenuItem {
  title: string
  href: string
  roles?: string[] // Als leeg, dan publiek toegankelijk
}

export const menuItems: MenuItem[] = [
  // Publieke items
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Publiek",
    href: "/public",
  },
  
  // Interne items (alle medewerkers)
  {
    title: "Intern",
    href: "/internal",
    roles: ["engineer", "operation", "finance"],
  },
  
  // Operations items
  {
    title: "Operatie",
    href: "/operation",
    roles: ["operation"],
  },
  
  // Finance items
  {
    title: "Finance",
    href: "/finance", 
    roles: ["finance"],
  },
]

// Helper functie om menu items te filteren op basis van user roles
export function getMenuForUser(userRoles: string[] = []): MenuItem[] {
  return menuItems.filter(item => {
    // Publieke items (geen roles gedefinieerd)
    if (!item.roles || item.roles.length === 0) {
      return true
    }
    
    // Check of user een van de vereiste roles heeft
    return item.roles.some(role => userRoles.includes(role))
  })
}
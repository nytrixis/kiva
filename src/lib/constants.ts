export const UserRole = {
    CUSTOMER: "CUSTOMER",
    SELLER: "SELLER",
    INFLUENCER: "INFLUENCER",
    ADMIN: "ADMIN"
  } as const;
  
  export type UserRole = typeof UserRole[keyof typeof UserRole];
  
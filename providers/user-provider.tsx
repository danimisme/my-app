'use client'

import { createContext, useContext } from 'react'

interface User {
  username: string
  role: string
}

const UserContext = createContext<User>({ username: '', role: '' })

export const useUser = () => useContext(UserContext)

export function UserProvider({ value, children }: { value: User; children: React.ReactNode }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

import { createContext, useContext } from 'react'
import { appsStore } from './AppsStore'

const StoresContext = createContext({ appsStore })

export const useStores = () => useContext(StoresContext)
export { StoresContext }
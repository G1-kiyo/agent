export const createUserSlice = (set)=>({
    user:null,
    setUser:(user)=>{
        set((state)=>({
            user:user
        }))
    }
})
export const createUserSlice = (set)=>({
    user:null,
    setUser:(user)=>{
        set(()=>({
            user:user
        }))
    }
})
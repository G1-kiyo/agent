
export const createAlertSlice = (set) => ({
    alerts: [],
    addAlert: (alert) => {
        set((state) => ({
            alerts: [...state.alerts, alert]
        }))
    },
    removeAlert: (id) => {
        set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id)
        }))
    },
    clearAllAlerts: () => {
        set(() => ({
            alerts: []
        }))
    }
})
export const getDatabaseUrl = () => {
    console.log('Current environment:', process.env.NODE_ENV)
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Using production database')
      return process.env.POSTGRES_URL
    }
    
    console.log('Using development database')
    return process.env.DATABASE_URL
  }
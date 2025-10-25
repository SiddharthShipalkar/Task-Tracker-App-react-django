import React,{useEffect} from 'react'
import axiosInstance from '../../axiosInstance'
const Dashboard = () => {
    useEffect(()=>{
        const fetchProtectedData = async ()=>{

            try{
                const response= await axiosInstance.get('/protected-view')
                console.log('Sucess:',response.data)

            } catch(error)
            {
                console.error('Error feteching data:',error)
            }
            
        }
        fetchProtectedData();
    },[])
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard
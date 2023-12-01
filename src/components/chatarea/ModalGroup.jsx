import {React, useState} from 'react'
import Modal from 'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatState } from '../../context/ChatProvider';
import axios from 'axios';
import UserList from '../avatar/UserList';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';


function ModalGroup({children}) {

    const [modalShow, setModalShow] = useState(false);
    const [groupChatName,setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search,setSearch] = useState("")
    const [searchResult,setSearchResult] = useState([])
    const [loading, setLoading] = useState(false);
    const handleModalShow = () => setModalShow(true);
    const handleModalClose = () => setModalShow(false);

    const {user, chats, setChats} = ChatState();

    const handleSearch =async(query)=>{
        setSearch(query);
        if(!query){
            return
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
            }
            const {data} = await axios.get(`/api/user/?search=${search}`,config);
            // console.log(data);
            setLoading(false)
            setSearchResult(data)
        } catch (error) {
            toast.error('Failed to fetch data')
        }
    }
    const handleSubmit=async()=>{
      if(!groupChatName || !selectedUsers){
        toast.warning('Fill all fields')
      }else{
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
        }
        const {data} = await axios.post(`/api/chat/group`,{
          name:groupChatName,
          users: JSON.stringify(selectedUsers.map((u)=>u._id))
        },config)
        setChats([data,...chats])
        handleModalClose()
        } catch (error) {
          toast.error('error occured')
        }
      }

    }
    const handleGroup=(userToAdd)=>{
        if(selectedUsers.includes(userToAdd)){
            toast.warning('user already selected')
        }
        setSelectedUsers([...selectedUsers, userToAdd])
    }

    const handleDelete =(delUser)=>{
      setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    }

  return (
   <>
   <span  className='d-flex align-items-center pb-2' onClick={handleModalShow}>{children}</span>
   <Modal
        show={modalShow}
        onHide={handleModalClose}
        animation={false}
        centered
      >
        <Modal.Header closeButton> Create Group</Modal.Header>
        <Modal.Body className='flex-column align-items-center'>
          <input onChange={(e)=>setGroupChatName(e.target.value)} type="text" className='form-control mb-3' placeholder='group chat name' />
          <input onChange={(e)=>handleSearch(e.target.value)} type="text" className='form-control mb-2' placeholder='Search Users' />
          <Stack direction="horizontal" gap={2}>
              {
                selectedUsers.map((u)=>(
                <Badge className='d-flex align-items-center p-2' key={u._id} user={u} bg="primary">{u.name} <span  className='fw-bolder ms-2'><i onClick={() => handleDelete(u)} className="fa-solid fa-x" style={{color: '#ffffff'}}></i></span></Badge>
                ))
              }
          </Stack>
          {
            loading?(
                <p>loading..</p>
            ):(
                searchResult?.slice(0, 4).map((user)=>
                <UserList key={user._id} user={user} handleFunction={()=> handleGroup(user)} />
                )
            )
          }
        </Modal.Body>
        <Modal.Footer>
          
          <button className="btn btn-primary" onClick={handleSubmit}>
            Create
          </button>
        </Modal.Footer>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
   </>
  )
}

export default ModalGroup
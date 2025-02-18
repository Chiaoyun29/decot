import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { getWorkspaceById, updateWorkspace, deleteWorkspace, getWorkspaceMembers, removeWorkspaceMember, getBoards } from '../services/api';
import CustomModal from '../common/CustomModal';
import SocketContext from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from './CreateBoardModal';
import ChatButton from '../chat/ChatDropdown';

const MentorWorkspaceContent = () => {
  const { workspaceId, boardId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { token } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isMemberDeleteModalOpen, setIsMemberDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const { socket, addNotificationCallback, removeNotificationCallback } = useContext(SocketContext);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBoards = async () => {
    const response = await getBoards(token, workspaceId);
    console.log(response);
    if (response.status === 200) {
      setBoards(response.boards);
    } else {
      console.error(response.error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [workspaceId, token]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const response = await getWorkspaceById(token, workspaceId);
      if (response.workspace) {
        // socket.emit('userAction', { action: 'viewWorkspace' });
        setWorkspace(response.workspace);
      } else {
        console.error(response.error);
      }
    };
    fetchWorkspace();
  }, [workspaceId, token]);

  useEffect(() => {
    if (socket) {
      const callback = (message) => {
      };
      addNotificationCallback(callback);
      return () => {
        removeNotificationCallback(callback);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (isManageMembersModalOpen) {
      fetchWorkspaceMembers();
    }
  }, [isManageMembersModalOpen]);

  const fetchWorkspaceMembers = async () => {
    try {
      const members = await getWorkspaceMembers(token, workspaceId);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(workspace.joinToken);
      setIsCodeCopied(true); // Set isCopied to true
      // socket.emit('userAction', { action: 'copyJoinCode' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 w-16 h-16 border-4 border-dashed rounded-full animate-spin dark:border-violet-400"></div>
      </div>
    );
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(workspace.inviteLink);
      setIsLinkCopied(true);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const handleUpdateWorkspace = async () => {
    const response = await updateWorkspace(token, workspaceId, {
      name: editedName,
      description: editedDescription
    });
    if (response.status === 200) {
      setWorkspace(response.workspace);
      setIsEditing(false);
    } else {
      console.error(response.error);
    }
  };

  const handleDeleteWorkspace = async () => {
    const response = await deleteWorkspace(token, workspaceId);
    if (response.status === 200) {
      navigate('/dashboard');
    } else {
      console.error(response.error);
    }
  };

  const handleDeleteMember = async () => {
    const response = await removeWorkspaceMember(token, workspaceId, selectedMember.id);
    if (response.status === 200) {
      fetchWorkspaceMembers(); // refresh the members list
      setIsMemberDeleteModalOpen(false);
    } else {
      console.error(response.error);
    }
  };

  const handleAnalysisClick = () => {
    navigate(`/workspace/${workspaceId}/menteeAnalysis`);
  };

  const handleSearchChange = (event) =>{
    setSearchQuery(event.target.value);
  }

  const filteredBoards = boards.filter(board =>
    board.boardTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-grow overflow-hidden">
        <div class="bg-white h-full w-1/4  shadow-lg overflow-y-auto p-4 space-y-4 ">
          {isEditing ? (
            <div className="p-4 my-2 bg-gray-100 text-gray-500">
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="mb-2 w-full px-3 py-2 border rounded-md"
                placeholder="Workspace Name"
              />
              <input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="mb-2 w-full px-3 py-2 border rounded-md"
                placeholder="Workspace Description"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateWorkspace}
                  className="mr-2 px-3 py-1 bg-indigo-500 text-white rounded-md"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div class="bg-gray-100 p-4 rounded-md shadow">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-semibold text-gray-700 uppercase">{workspace.name}</h2>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedName(workspace.name);
                    setEditedDescription(workspace.description);
                  }}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <img src="/image/icon_pencil.svg" alt="edit icon" className="w-4 h-4" />
                </button>
              </div>
              <p className="pt-2 mb-2 text-xl text-gray-600">{workspace.description}</p>
            </div>
          )}

          {/* Sidebar Options */}
          <div className="flex flex-col space-y-2">
            <div className="mt-auto"> {/* This div will grow and push the buttons to the bottom */}
              {/* Invite button that opens modal */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="font-semibold w-full flex items-center justify-center py-2 px-4 my-3 text-white bg-indigo-500 hover:bg-purple-600 focus:ring-indigo-500 focus:ring-offset-yellow-200 transition ease-in duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              >
                Invite Members
              </button>

              {/* Manage members */}
              <button
                onClick={() => setIsManageMembersModalOpen(true)}
                className="font-semibold w-full flex items-center justify-center py-2 px-4 my-3 text-white bg-indigo-500 hover:bg-purple-600 focus:ring-indigo-500 focus:ring-offset-yellow-200 transition ease-in duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              >
                Manage Members
              </button>

              {/* Add Analysis Button */}
              <button
                onClick={handleAnalysisClick}
                className="font-semibold w-full flex items-center justify-center py-2 px-4 my-3 text-white bg-indigo-500 hover:bg-purple-600 focus:ring-indigo-500 focus:ring-offset-yellow-200 transition ease-in duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              >
                Mentee Analysis
              </button>

              {/* Delete Workspace button at the bottom */}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="font-semibold w-full flex items-center justify-center py-2 px-4 my-3 text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 focus:ring-offset-yellow-200 transition ease-in duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              >
                Delete Workspace
              </button>
            </div>
          </div>

          {/* The Modal for Invite */}
          <CustomModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setIsCodeCopied(false);
              setIsLinkCopied(false);
            }}
            title="Invite Members"
            message="Share this code/link with the members you want to invite:"
            modalStyle={{ minWidth: '500px' }} // Add a modalStyle prop if your CustomModal supports it
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={workspace.joinToken}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyCode}
                  className={
                    isCodeCopied
                      ? "px-4 py-2 font-semibold bg-green-500 text-white rounded-md"
                      : "px-4 py-2 font-semibold rounded-md bg-gray-100"
                  }
                >
                  {isCodeCopied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={workspace.inviteLink}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className={
                    isLinkCopied
                      ? "px-4 py-2 font-semibold bg-green-500 text-white rounded-md"
                      : "px-4 py-2 font-semibold rounded-md bg-gray-100"
                  }
                >
                  {isLinkCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </CustomModal>

          {/* The Modal for Delete Workspace Confirmation */}
          <CustomModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Workspace"
            message="Are you sure you want to delete this workspace?"
          >
            <div className="flex items-center">
              <button
                onClick={handleDeleteWorkspace}
                className="mr-4 px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          </CustomModal>
        </div>

        {/* The Modal for Manage Member */}
        <CustomModal
          isOpen={isManageMembersModalOpen}
          onClose={() => setIsManageMembersModalOpen(false)}
          title="Manage Members"
        >
          <ul>
            {workspaceMembers && workspaceMembers.length > 0 ? (
              workspaceMembers.map(member => (
                <li key={member.id} className="flex justify-between items-center mb-2">
                  <span>{member.username}</span>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsMemberDeleteModalOpen(true);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <p>No members found</p>
            )}
          </ul>
        </CustomModal>

        {/* The Modal for Delete Member Confirmation */}
        <CustomModal
          isOpen={isMemberDeleteModalOpen}
          onClose={() => setIsMemberDeleteModalOpen(false)}
          title="Delete Member"
          message={`Are you sure you want to remove ${selectedMember?.username} from the workspace?`}
        >
          <div className="flex items-center">
            <button
              onClick={handleDeleteMember}
              className="mr-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
            <button
              onClick={() => setIsMemberDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </CustomModal>

        {/* Main content container */}
        <div className="w-3/4 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          <li
            className="fixed bottom-4 right-4 px-3 py-2 flex items-center text-xs font-bold leading-snug text-black z-50"
            onClick={() => setShowMessages(!showMessages)}
          >
            <ChatButton />
          </li>

          {/* Your main content */}
          {/* Section */}
          <div className="flex justify-between items-center py-2">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2"> 
                  <button type="submit" className="p-2 focus:outline-none focus:ring">
                    <svg fill="currentColor" viewBox="0 0 512 512" className="w-5 h-5 dark:text-gray-400">
                      <path d="M479.6,399.716l-81.084-81.084-62.368-25.767A175.014,175.014,0,0,0,368,192c0-97.047-78.953-176-176-176S16,94.953,16,192,94.953,368,192,368a175.034,175.034,0,0,0,101.619-32.377l25.7,62.2L400.4,478.911a56,56,0,1,0,79.2-79.195ZM48,192c0-79.4,64.6-144,144-144s144,64.6,144,144S271.4,336,192,336,48,271.4,48,192ZM456.971,456.284a24.028,24.028,0,0,1-33.942,0l-76.572-76.572-23.894-57.835L380.4,345.771l76.573,76.572A24.028,24.028,0,0,1,456.971,456.284Z"></path>
                    </svg>
                  </button>
                </span>
                <input type="search" name="Search" placeholder="Search Board..." className="py-2 pl-10 text-m rounded-md" value={searchQuery} onChange={handleSearchChange} />
              </div>
            <button
              onClick={() => setModalIsOpen(true)}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-yellow-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            >
              Create Board
            </button>
          </div>
          <div className="p-4 bg-white rounded shadow-md">
            {/* ... content for section 1 ... */}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBoards.map((board) => (
                <li key={board.id} className="p-15 border rounded-md">
                  <Link to={`board/${board.id}`} className="block" //need to do modi for linkage
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <div className="text-center font-medium">{board.boardTitle}</div>
                    <div className="text-center text-gray-600">{board.description}</div>
                    <div className="text-center text-gray-600">{board.dtTag}</div>
                    <div className="text-center text-gray-600">Status: {board.status}</div>
                    <div className="text-center text-gray-600">
                      {new Date(board.deadline).toLocaleString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <CreateBoardModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} onBoardCreated={fetchBoards} />
          </div>
          {/* Section */}
        </div>
      </div>
    </div>
  );

};

export default MentorWorkspaceContent;
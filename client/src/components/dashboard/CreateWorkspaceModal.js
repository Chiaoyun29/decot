import React, { useState, useContext } from 'react';
import { createWorkspace } from '../services/api';
import { useAuthContext } from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { socket} = useContext(SocketContext);

  // Access the token from AuthContext
  const { token } = useAuthContext();

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleSubmit = async () => {
    try {
      // Pass the token to the createWorkspace function
      const color = getRandomColor();
      const response = await createWorkspace(token, name, description, color);
      if (response.workspace) {
        const { workspace } = response;
        socket.emit('userAction', { action: 'createWorkspace' });
        const joinLink = `${window.location.origin}/workspace/join/${workspace.joinToken}`;
        // After success, clear the form
        setName('');
        setDescription('');
        onClose();
        onWorkspaceCreated();
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 bg-white rounded-md">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Create Workspace</h3>
          <input
            type="text"
            placeholder="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <textarea
            placeholder="Workspace Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-blue-600"
          >
            Create
          </button>
          <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-600">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
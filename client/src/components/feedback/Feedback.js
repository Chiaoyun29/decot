import React from 'react';
import { TbHelpSquareFilled } from "react-icons/tb";

const Feedback=()=>{
    const gmailURL = "https://mail.google.com/mail/u/0/?fs=1&to=tanchiaoyun@gmail.com&tf=cm&su=Decot%20Feedback";

    return(
        <div>
            <a href={gmailURL} target="_blank" rel="noopener noreferrer">
                <button className="w-6 h-6 text-gray-800 dark:text-white">
                    <TbHelpSquareFilled size={25} alt="Feedback" />
                </button>
            </a> 
        </div>
    );
};

export default Feedback;

import React from 'react';

const ReuseableCard = ({title,icon,amount,stat}) => {
    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className='flex justify-between items-center'>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <span>{icon}</span>
              </div>
                <p className="text-4xl font-bold"> &#2547; {amount} </p>
                <p className="text-md ">{stat ||'+20.1% from last month'} </p>
            </div>
        </>
    );
};

export default ReuseableCard;
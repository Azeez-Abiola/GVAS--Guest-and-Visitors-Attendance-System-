import React from 'react'

const GvasLogo = ({ variant = 'dark', className = '' }) => {
  const logoSrc = variant === 'white' ? '/images/gvaswhite.jpg' : '/images/gvasblack.jpg'
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt="GVAS Logo" 
        className="h-12 w-auto object-contain"
      />
    </div>
  )
}

export default GvasLogo
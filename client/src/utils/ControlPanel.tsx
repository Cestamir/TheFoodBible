import React from 'react'

interface controlPanelProps{
    nodeServerRunning: string;
}

const ControlPanel = ({nodeServerRunning} : controlPanelProps) => {
  return (
    <div>CONTROL PANEL : {nodeServerRunning}</div>
  )
}

export default ControlPanel
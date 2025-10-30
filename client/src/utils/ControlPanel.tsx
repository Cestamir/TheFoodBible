// testing component fro backend

interface controlPanelProps{
    nodeServerRunning: string;
}

const ControlPanel = ({nodeServerRunning} : controlPanelProps) => {
  return (
    <div>CONTROL PANEL : {nodeServerRunning}</div>
  )
}

export default ControlPanel
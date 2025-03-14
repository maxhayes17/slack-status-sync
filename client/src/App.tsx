import './App.css';
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <div>
        <div className='flex flex-col space-y-4 text-center'>
          <h1 className='text-4xl font-bold text-center'>Slack Status Syncer</h1>
          <p>Sync your Slack status with Google Calendar events </p>
        </div>
      </div>
    </Layout>
  );
}

export default App;

export default function Sidebar() {
  return (
    <div className='h-full bg-black/90 w-64 flex flex-col justify-between'>
      <div className='flex justify-center'>
        <h1 className='text-white text-2xl p-5'>gather</h1>
        <div></div>
      </div>
      <div className='p-5 flex flex-col justify-center gap-5'>
        <button className='bg-green-500 rounded-lg w-full'>
          <p className='p-1'>create room</p>
        </button>
        <button className='bg-fuchsia-500 rounded-lg w-full'>
          <p className='p-1'>join room</p>
        </button>
        <button className='bg-gray-700 rounded-lg w-full'>
          <p className='p-1'>logout</p>
        </button>
      </div>
    </div>
  );
}

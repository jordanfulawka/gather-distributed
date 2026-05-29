'use client';

export default function JoinRoomModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (roomId: string) => void;
}) {
  return (
    <div
      className='bg-black/50 fixed inset-0 flex justify-center items-center z-50'
      onClick={onClose}
    >
      <div className='bg-white w-96' onClick={(e) => e.stopPropagation}>
        hey
      </div>
    </div>
  );
}

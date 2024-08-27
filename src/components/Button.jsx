export function Button({ outline, small, label, buttonAction, type }) {
  if (type === 'back') {
    return (
      <div
        onClick={buttonAction}
        type={type}
        // disabled={disabled}
        className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        flex
        justify-center
        cursor-pointer
        select-none
        ${outline ? 'bg-white' : 'bg-[#61794a]'}
        ${outline ? 'border-[#61794a]' : 'border-[#61794a]'}
        ${outline ? 'text-[#61794a]' : 'text-white'}
        ${small ? 'py-1' : 'py-3'}
        ${small ? 'text-sm' : 'text-md'}
        ${small ? 'font-light' : 'font-semibold'}
        ${small ? 'border-[1px]' : 'border-2'}
      `}
      >
        {label}
      </div>
    )
  }
  return (
    <button
      onClick={buttonAction}
      type={type}
      // disabled={disabled}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        select-none
        ${outline ? 'bg-neutral-300' : 'bg-[#61794a]'}
        ${outline ? 'border-black' : 'border-[#61794a]'}
        ${outline ? 'text-black' : 'text-white'}
        ${small ? 'py-1' : 'py-3'}
        ${small ? 'text-sm' : 'text-md'}
        ${small ? 'font-light' : 'font-semibold'}
        ${small ? 'border-[1px]' : 'border-2'}
      `}
    >
      {label}
    </button>
  )
}

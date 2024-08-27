export function Input({ id, label, error, register, required }) {
  return (
    <div className="w-full relative">
      <input
        id={id}
        placeholder=" "
        {...register(id, { required })}
        className={`
        peer
        w-full
        p-4
        pt-6
        bg-white
        font-semibold
        text-[#61794a]
        border-2
        rounded-md
        outlined-none
        focus:outline-none
        transition
        disabled:opacity-70
        disabled:cursor-not-allowed
        pl-4
        focus:border-[#61794a]
        ${error ? 'border-rose-400' : 'border-[#61794a]/60'}
        ${error ? 'focus:border-rose-400' : 'focus:border-[#61794a]'}
      `}
      />
      <label
        htmlFor={id}
        className={`
        absolute
        text-xs
        sm:text-lg
        cursor-text
        duration-150
        transform
        -translate-y-[18px]
        top-6
        sm:top-5
        origin-[0]
        peer-placeholder-shown:scale-100
        peer-placeholder-shown:translate-y-0
        peer-focus:scale-75
        peer-focus:text-[#61794a]
        peer-focus:-translate-y-4
        left-4
        ${error ? 'text-rose-400' : 'text-[#61794a]/80'}
      `}
      >
        {label}
      </label>
    </div>
  )
}

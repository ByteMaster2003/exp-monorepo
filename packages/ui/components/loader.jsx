import loader from "../assets/loader.svg";

export const LoaderComponent = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-[#171717]">
      <img src={loader} alt="loader" className="size-32 translate-y-[-200px]" />
    </div>
  );
};

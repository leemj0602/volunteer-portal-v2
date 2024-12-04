import { MdOutlineLockReset } from "react-icons/md";
import ResetPassword from "../../../../assets/ResetPassword.png";
import Swal from "sweetalert2";
import config from "../../../../../config.json";

export function ResetPasswordButton() {
  const openReset = async () => {
    const result = await Swal.fire({
      imageUrl: ResetPassword,
      imageHeight: 120,
      imageWidth: 180,
      width: 420,
      title: "Reset Password",
      text: "Are you sure you want to reset your password? You will be redirected to another page.",
      confirmButtonText: "Redirect",
      confirmButtonColor: "#5a71b4",
      cancelButtonText: "No",
      showCloseButton: true,
      showCancelButton: true
    })
    if (result.isConfirmed) window.open(`${config.domain}/wp-login.php?action=lostpassword`, "_blank");
  }

  return <button type="button" onClick={openReset} className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-center sm:justify-between items-center gap-x-3">
    <MdOutlineLockReset size={18} />
    <span>Reset Password</span>
  </button>
}
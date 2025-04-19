import { catchAsync } from "shared-utils";

const register = catchAsync(async (_req, _res) => {});

const login = catchAsync(async (_req, _res) => {});

const logout = catchAsync(async (_req, _res) => {});

const resetPasswordRequest = catchAsync(async (_req, _res) => {});

const resetPasswordConfirm = catchAsync(async (_req, _res) => {});

export default { register, login, logout, resetPasswordRequest, resetPasswordConfirm };

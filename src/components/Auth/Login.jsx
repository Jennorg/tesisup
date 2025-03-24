import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
	return (
		<div className="grid place-items-center w-dvw h-dvh">
			<h1>Login</h1>
			<form action="" className="flex flex-col">
				<input type="email"></input>
				<input type="password"></input>
				<button type="button">Cancelar</button>
				<button type="submit">Continuar</button>
			</form>
		</div>
	);
}

export default Login;
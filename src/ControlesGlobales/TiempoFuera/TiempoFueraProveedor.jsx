import React, { createContext, useEffect, useRef, useState } from 'react'
import { autoAcceso, obtenerDatosDelLocalStorage } from '../../FuncionesGlobales';
import { Button, Modal } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom';

export const tiempoFueraContext = createContext(null)

export function TiempoFueraProveedor({ children }) {

    const timeoutRef = useRef();
    const [mostrarModalTiempoFuera, setMostrarModalTiempoFuera] = useState(false);
    const navegar = useNavigate()
    useEffect(() => {
        const handleWindowEvents = () => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                // muestra el modal de refrescar la página.
                setMostrarModalTiempoFuera(true);
            }, 300000); // 5 minutos de inactividad

            if(!obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE)) {
                autoAcceso().finally(()=>{
                    console.log('hubo un error, se perdió la sesión, intentando restaurar.')
                })
            }
        };

        window.addEventListener("mousemove", handleWindowEvents);
        window.addEventListener("keydown", handleWindowEvents);
        window.addEventListener("click", handleWindowEvents);
        window.addEventListener("scroll", handleWindowEvents);

        handleWindowEvents();

        return () => {
            window.removeEventListener("mousemove", handleWindowEvents);
            window.removeEventListener("keydown", handleWindowEvents);
            window.removeEventListener("click", handleWindowEvents);
            window.removeEventListener("scroll", handleWindowEvents);
        };
    }, []);

    const refrescarAplicacion = async () => {
        await autoAcceso().finally(() => {
            setMostrarModalTiempoFuera(false);
            window.location.reload();
        })
    };

    return (
        <tiempoFueraContext.Provider value={{ mostrarModalTiempoFuera, setMostrarModalTiempoFuera }}>
            {children}
            <Modal
                show={mostrarModalTiempoFuera}
                onHide={() => setMostrarModalTiempoFuera(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header >
                    <Modal.Title><Icon.InfoCircle size={25} /> Bellon S.A.S</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Hicimos una pausa mientras estabas ausente, actualiza para continuar.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => refrescarAplicacion()}> Refrescar</Button>
                </Modal.Footer>
            </Modal>
        </tiempoFueraContext.Provider>
    )

}
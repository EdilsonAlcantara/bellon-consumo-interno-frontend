import { createContext, useEffect, useReducer } from "react";
import { rutas as rutasModulos } from "../../Archivos/Configuracion/Rutas";
import { guardarDatosEnLocalStorage, obtenerDatos, obtenerDatosDelLocalStorage, obtenerNombreUsuarioLoggeado } from "../../FuncionesGlobales";
import { estadoInicialMenuVertical } from "./menuVerticalModel";
import { menuVerticalReducer } from "./menuVerticalReducer";

export const menuVerticalContexto = createContext(null);

export default function MenuVerticalProveedor({ children }) {
    const [state, dispatch] = useReducer(menuVerticalReducer, estadoInicialMenuVertical)

    const cargarPerfilUsuarioLogueado = async () => {
        return await obtenerDatos(`UsuariosCI/Correo?correo=${obtenerNombreUsuarioLoggeado()}`, null)
            .then((res) => {
                const json = res.data;
                console.log('cargarPerfilUsuarioLogueado', json)
                guardarDatosEnLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE_PERFIL_USUARIO, JSON.stringify(json))
            }).catch((err) => {
                console.log('Error ', err)
            }).finally(() => {
                console.log('carga de datos finalizada')
            })
    }

    const regularRutasDelPerfilUsuarioLogueado = () => {

        const datosUsuarioLogueado = obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE_PERFIL_USUARIO);
        const usuarioLogueado = datosUsuarioLogueado !== null;

        let urls = []
        if (usuarioLogueado) {
            switch (datosUsuarioLogueado.posicion_id) {
                case 1: // 'Administrador':
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_NUEVAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_PENDIENTES,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_RECHAZADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_APROBADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_ENTREGADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONFIRMADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_TERMINADAS,
                        import.meta.env.VITE_APP_BELLON_MANTENIMIENTO_CLASIFICACIONES,
                        import.meta.env.VITE_APP_BELLON_MANTENIMIENTO_USUARIOS
                    ].includes(r.ruta));
                    break;
                case 2: // 'Director'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_PENDIENTES,
                    ].includes(r.ruta));
                    break;
                case 3: // 'Gerente Tienda'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_PENDIENTES,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_RECHAZADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_APROBADAS
                    ].includes(r.ruta));
                    break;
                case 4: // 'Gerente Area'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_PENDIENTES,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_RECHAZADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_APROBADAS
                    ].includes(r.ruta));
                    break;
                case 5: // 'Solicitante'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_NUEVAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_PENDIENTES,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_RECHAZADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_APROBADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_ENTREGADAS
                    ].includes(r.ruta));
                    break;
                case 6: // 'Asistente Con. Inventario'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONFIRMADAS,
                    ].includes(r.ruta));
                    break;
                case 7: // 'Asistente Contabilidad'
                case 8: // 'Despachador'
                    urls = rutasModulos.filter(r => [
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_RECHAZADAS,
                        import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONFIRMADAS,
                    ].includes(r.ruta));
                    break;
                default:
                    urls = [];
                    break;
            }
        }

        return urls;
    }

    const cargarDatos = async () => {
        await cargarPerfilUsuarioLogueado();
        regularRutasDelPerfilUsuarioLogueado(rutasModulos);
    }

    useEffect(() => {
        cargarDatos();
    }, [])

    return (
        <menuVerticalContexto.Provider value={{ state, dispatch, rutas: regularRutasDelPerfilUsuarioLogueado() }}>
            {children}
        </menuVerticalContexto.Provider>
    )

}
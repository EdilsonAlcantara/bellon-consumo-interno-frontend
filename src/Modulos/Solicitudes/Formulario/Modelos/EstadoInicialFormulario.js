export const EstadoInicialFormulario = {
    formulario: {
        id_cabecera_solicitud: null,
        no_documento: "",
        fecha_creado: "",
        creado_por: "",
        usuario_responsable: "",
        usuario_despacho: "",
        id_departamento: "",
        id_estado_solicitud: null,
        id_clasificacion: null,
        id_sucursal: "",
        comentario: "",
        total: 0,
        id_usuario_responsable: null,
        id_usuario_despacho: null,
    },
    inactivarCampos: {
        campo_id_cabecera_solicitud: true,
        campo_no_documento: true,
        campo_fecha_creado: true,
        campo_comentario: true,
        campo_creado_por: true,
        campo_usuario_responsable: true,
        campo_usuario_despacho: true,
        campo_id_departamento: true,
        campo_id_estado_solicitud: true,
        campo_id_clasificacion: true,
        campo_id_sucursal: true,
        campo_fecha_modificado: true,
        campo_modificado_por: true,
        campo_total: true,
        campo_id_usuario_responsable: true,
        campo_id_usuario_despacho: true,
    },
    camposRequeridos: {
        requerido_id_cabecera_solicitud: true,
        requerido_no_documento: true,
        requerido_fecha_creado: true,
        requerido_comentario: true,
        requerido_creado_por: true,
        requerido_usuario_responsable: true,
        requerido_usuario_despacho: true,
        requerido_id_departamento: true,
        requerido_id_estado_solicitud: true,
        requerido_id_clasificacion: true,
        requerido_id_sucursal: true,
        requerido_fecha_modificado: true,
        requerido_modificado_por: true,
        requerido_total: true,
        requerido_id_usuario_responsable: true,
        requerido_id_usuario_despacho: true,
    },
    estadoCambiado: false,
    limiteAprobacion: 0,
    ultimaActualizacionDeRegistro: 'ninguna',
    lineas: [],
    validadoFormulario: false,
    modalAgregarProductos: false,
    listadoProductos: [],
    comboEstadoSolicitudes: [],
    comboDepartamentos: [],
    comboUsuarios: [],
    comboSucursales: [],
    comboPosiciones: [],
    comboUsuariosCI: [],
    comboClasificaciones: [],
    comboUsuariosAprobadores: [],
    comboUnidadesMedida: [],
    comboAlmacenes: [],
    productosSeleccionados: []
}

export const pagination = true;
export const paginationPageSize = 500;
export const paginationPageSizeSelector = [200, 500, 1000];
export const rowSelection = false
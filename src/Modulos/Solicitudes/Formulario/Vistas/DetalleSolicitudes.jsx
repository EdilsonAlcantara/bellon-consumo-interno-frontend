import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useSearchParams } from 'react-router-dom';
import AGGridTabla from '../../../../ComponentesGlobales/AGGridTabla';
import { useAlerta } from '../../../../ControlesGlobales/Alertas/useAlerta';
import { useModalAlerta } from '../../../../ControlesGlobales/ModalAlerta/useModalAlerta';
import { formatoCantidad, formatoMoneda } from '../../../../FuncionesGlobales';
import { useFormulario } from '../Controles/useFormulario';
import { pagination, paginationPageSize, paginationPageSizeSelector, rowSelection } from '../Modelos/EstadoInicialFormulario';

export default function DetalleSolicitudes() {

    const { state, dispatch, guardarLineas, eliminaLinea } = useFormulario();
    const { dispatch: dispatchAlerta } = useAlerta();
    const { dispatch: dispatchModalAlerta } = useModalAlerta();
    const gridRef = useRef(null);
    const [locacion] = useSearchParams();
    const [inactivarCamposEditablesTabla, setInactivarCamposEditablesTabla] = useState(true);

    const campoEdicionEstilos = !inactivarCamposEditablesTabla ? {} : {
        backgroundColor: "#f2f2f2",
        padding: 0,
        border: "1px solid #bebebe",
        borderRadius: "5px",
        cursor: "pointer"
    };

    const quitarStylosColumnaFooter = (params) => {
        return !params.node.rowPinned ? campoEdicionEstilos : null;
    };

    const obtenerReferenciaAgGrid = (ref) => {
        gridRef.current = ref.current;
    };

    const BotonesAcciones = (parametros) => {
        const linea = parametros.data;
        return (
            <>
                {!linea.acciones && (<Button title="Eliminar linea" size='sm' variant='outline-primary' style={{ marginLeft: 5 }} onClick={() => eliminaLinea(linea.id_linea_solicitud)}> <Icon.Trash /> </Button>)}
            </>
        )
    }

    const [columnasProductos] = useState([
        { headerName: 'Producto ID', field: "no_producto", flex: 1 },
        { headerName: 'Descripcion', field: "descripcion", flex: 4 },
        { headerName: 'Cantidad', field: "cantidad", editable: inactivarCamposEditablesTabla, valueFormatter: (e) => formatoCantidad(e.value), cellStyle: quitarStylosColumnaFooter, flex: 1, },
        { headerName: 'Unidad', field: "codigo_unidad_medida", flex: 1 },
        { headerName: 'Precio Unitario', field: "precio_unitario", flex: 1, valueFormatter: (e) => formatoMoneda(e.value, 2, '$') },
        { headerName: 'Total', field: "total", flex: 1, valueFormatter: (e) => formatoMoneda(e.value, 2, '$') },
        { headerName: 'Nota', field: "nota", editable: inactivarCamposEditablesTabla, cellStyle: quitarStylosColumnaFooter, flex: 4 },
        { headerName: 'Acciones', field: "Accion", cellRenderer: BotonesAcciones, flex: 1 },
    ]);

    const mostrarAgregarProductos = () => {
        dispatch({ type: 'mostrarModalAgregarProductos', payload: { mostrar: true } })
    }

    const obtenerEventoFueraTabla = useCallback((event) => {
        if (gridRef.current) {
            gridRef.current.api.stopEditing();
        }
    }, []);

    useEffect(() => {
        document.addEventListener("click", obtenerEventoFueraTabla);
        return () => document.removeEventListener("click", obtenerEventoFueraTabla);
    }, [obtenerEventoFueraTabla]);

    useEffect(() => {
        const nuevaSolicitud = ((state.formulario.id_cabecera_solicitud === null && locacion.get('accion') === null) || (locacion.get('accion') === 'ver' && state.formulario.id_cabecera_solicitud !== null));
        console.log("nuevaSolicitud =>", locacion.get('accion'))
        setInactivarCamposEditablesTabla(nuevaSolicitud);
    }, [locacion])

    const cambioElValorEnLaTabla = (params) => {

        console.log("Celda actualizada:", params.data);
        const { colDef, newValue, oldValue } = params;
        let error = false;
        if (newValue !== oldValue) {
            if (colDef.field === "cantidad") {

                if (isNaN(newValue) || newValue <= 0) {
                    dispatchAlerta({ type: "mostrarAlerta", payload: { tipo: "danger", mensaje: "La cantidad debe ser un número positivo.", mostrar: true, } });
                    dispatch({ type: "actualizarCampoEnLineaSolicitud", payload: { linea: params.data, id: params.data.id_linea_llegada, [colDef.field]: oldValue, }, });
                    error = true;
                }

                if (!isNaN(newValue) && newValue <= 0) {
                    dispatchAlerta({
                        type: "mostrarAlerta",
                        payload: {
                            tipo: "danger",
                            mensaje: "La cantidad debe ser mayor a 0.",
                            mostrar: true,
                        },
                    });
                    dispatch({
                        type: "actualizarCampoEnLineaSolicitud",
                        payload: {
                            linea: params.data,
                            id: params.data.id_linea_solicitud,
                            [colDef.field]: oldValue,
                        },
                    });
                    error = true;
                }

            }
            if (!error) {
                guardarLineas(state.lineas);
            }
        }
    }

    const calcularTotales = (parametros = []) => {
        const total = parametros.reduce((total, fila) => total + fila.total, 0);
        const cantidad = parametros.reduce((cantidad, fila) => cantidad + fila.cantidad, 0);
        const no_producto = parametros.length;
        return [
            {
                acciones: true,
                no_producto,
                cantidad,
                total,
            }
        ];
    };

    return (
        <>
            <Row>
                <Col>
                    <div style={{ float: 'right', marginBottom: 5 }}>
                        <Button disabled={inactivarCamposEditablesTabla} size='md' variant='primary' onClick={() => mostrarAgregarProductos()}><Icon.Plus />Agregar Productos</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <AGGridTabla
                        obtenerReferenciaAgGrid={obtenerReferenciaAgGrid}
                        colDefs={columnasProductos}
                        rowData={state.lineas}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        paginationPageSize={paginationPageSize}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                        onCellValueChanged={cambioElValorEnLaTabla}
                        datosPieTabla={calcularTotales(state.lineas)}
                    />
                </Col>
            </Row>
        </>
    )
}

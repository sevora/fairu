import react from 'react';
import { DataGrid } from '@material-ui/data-grid';

export default function MuiDataGrid(props) {
    /*
    2021-01-08
    Work around MUI DataGrid issue that sets `height: 0px;` when autoHeight is enabled 
    https://github.com/mui-org/material-ui-x/issues/604
    
    Get the first div (which is the MUI datagrid element) and clear the 0px CSS height style
    */
    const gridWrapperRef = react.useRef(null);
    react.useLayoutEffect(() => {
        const gridDiv = gridWrapperRef.current;
        if (gridDiv){
            const gridEl = gridDiv.querySelector('div');
            gridEl.style.height = '';
        }
    });
    
    return (
        <div ref={gridWrapperRef}>
            <DataGrid
                rows={props.rows}
                columns={props.columns}
                autoHeight={true}
                rowCount={props.rowCount}
                pagination 
                paginationMode="server"
                onPageChange={props.onPageChange}
                rowsPerPageOptions={props.rowsPerPageOptions}
                pageSize={props.pageSize} 
            />
        </div>
    );
}


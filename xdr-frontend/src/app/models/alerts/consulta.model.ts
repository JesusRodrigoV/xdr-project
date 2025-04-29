export interface Consulta {
  id?: number;
  user_id: number;
  tipo: string;
  descripcion: string;
  fecha_consulta?: Date;
}

export interface ConsultasPaginadas {
  rows: Consulta[];
  total?: number;
}

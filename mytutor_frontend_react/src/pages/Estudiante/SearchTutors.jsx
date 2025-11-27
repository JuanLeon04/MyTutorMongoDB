import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorApi } from '../../api/tutorApi';

const SearchTutors = () => {
  const [tutores, setTutores] = useState([]);
  const [filteredTutores, setFilteredTutores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [materiaFilter, setMateriaFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutores();
  }, []);

  useEffect(() => {
    filterTutores();
  }, [searchTerm, materiaFilter, tutores]);

  const loadTutores = async () => {
    try {
      const data = await tutorApi.listAllTutors();
      console.log('📊 Tutores cargados - Datos completos:', JSON.stringify(data[0], null, 2));
      setTutores(data);
      setFilteredTutores(data);
    } catch (error) {
      console.error('Error cargando tutores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTutores = () => {
    let filtered = tutores;

    if (searchTerm) {
      filtered = filtered.filter((tutor) =>
        tutor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (materiaFilter) {
      filtered = filtered.filter((tutor) => {
        if (!tutor.materias || !Array.isArray(tutor.materias)) return false;
        
        return tutor.materias.some((materia) => {
          const nombreMateria = typeof materia === 'object' ? materia.nombre : materia;
          return nombreMateria?.toLowerCase().includes(materiaFilter.toLowerCase());
        });
      });
    }

    setFilteredTutores(filtered);
  };

  if (loading) return <div className="loading">Buscando tutores disponibles...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>🔍 Buscar Tutores</h1>

      {/* Filtros de búsqueda */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Buscar por nombre:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre del tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Filtrar por materia:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Matemáticas, Física..."
              value={materiaFilter}
              onChange={(e) => setMateriaFilter(e.target.value)}
            />
          </div>
        </div>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          📊 Mostrando {filteredTutores.length} de {tutores.length} tutores
        </p>
      </div>

      {/* Lista de tutores */}
      {filteredTutores.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            No se encontraron tutores que coincidan con tu búsqueda
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredTutores.map((tutor) => {
            const nombreCompleto = `${tutor.nombre || ''} ${tutor.apellido || ''}`.trim() || 'Tutor';
            
            return (
              <div key={tutor.id} className="card">
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    {(tutor.usuario?.fotoPerfil || tutor.fotoPerfil) ? (
                      <img
                        src={tutor.usuario?.fotoPerfil || tutor.fotoPerfil}
                        alt={`Foto de ${tutor.usuario?.nombre || tutor.nombre}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #4caf50'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        color: '#999',
                        border: '3px solid #4caf50'
                      }}>
                        👤
                      </div>
                    )}
                    <div>
                      <h3 style={{ marginBottom: '5px', color: '#2c3e50' }}>
                        {tutor.usuario?.nombre && tutor.usuario?.apellido 
                          ? `${tutor.usuario.nombre} ${tutor.usuario.apellido}`
                          : tutor.nombre || 'Tutor'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#f57c00', fontSize: '18px' }}>
                          {'⭐'.repeat(Math.round(tutor.califiacionPromedio || 0))}
                        </span>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          ({tutor.califiacionPromedio?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                    {tutor.bio?.substring(0, 120)}...
                  </p>

                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '14px' }}>📚 Materias:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                      {tutor.materias?.slice(0, 3).map((materia, index) => {
                        const nombreMateria = typeof materia === 'object' ? materia.nombre : materia;
                        const experiencia = typeof materia === 'object' ? materia.experiencia : null;
                        
                        return (
                          <span
                            key={index}
                            className="badge badge-info"
                            style={{ fontSize: '12px' }}
                            title={experiencia ? `${experiencia} años de experiencia` : ''}
                          >
                            {nombreMateria}
                            {experiencia && ` (${experiencia}a)`}
                          </span>
                        );
                      })}
                      {tutor.materias?.length > 3 && (
                        <span className="badge badge-info" style={{ fontSize: '12px' }}>
                          +{tutor.materias.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50', marginTop: '10px' }}>
                    💰 ${tutor.precioHora}/hora
                  </p>
                </div>

                <Link to={`/tutor/${tutor.idTutor}`} style={{ textDecoration: 'none', marginTop: '15px' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                    Ver Perfil y Reservar
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchTutors;

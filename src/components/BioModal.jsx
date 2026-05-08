function BioModal({ type, data, onClose }) {
  if (!data) return null;

  const isComposer = type === "composer";
  const isInstrument = type === "instrument";

  const bio = data.content?.[0];

  return (
    <div className="bioModal">
      <div className="bioModal_overlay" onClick={onClose}></div>

      <div className="bioModal_card">
        <button type="button" className="bioModal_close" onClick={onClose}>
          <img src="/assets/images/ui/game/X-escape.png" alt="Fermer" />
        </button>

        <div className="bioModal_content">
          {isInstrument && data.image && (
            <img
              src={data.image}
              alt={data.name}
              className="bioModal_instrumentImage"
            />
          )}

          <h2>{data.name}</h2>

          {isComposer && (
            <>
              <section>
                <h3>{bio.title}</h3>

                <p>
                  <strong>Naissance :</strong> {bio.data.birth}
                  <br />
                  <strong>Genre artistique :</strong> {bio.data.style}
                  <br />
                  <strong>Instruments :</strong> {bio.data.instruments}
                  <br />
                  <strong>Œuvres principales :</strong> {bio.data.works}
                </p>
              </section>

              {data.content.slice(1).map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </section>
              ))}
            </>
          )}

          {isInstrument && (
            <>
              <section>
                <h3>Biographie</h3>

                <p>
                  <strong>Famille :</strong> {data.family}
                  <br />
                  <strong>Dimensions :</strong> {data.dimensions}
                  <br />
                  <strong>Poids :</strong> {data.weight}
                  <br />
                  <strong>Répertoire phare :</strong> {data.repertoire}
                </p>
              </section>

              {data.sections?.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BioModal;

import "@tavus/embed";

import {
  forwardRef,
} from "react";


const DEPLOYMENT_ID =
  import.meta.env.VITE_TAVUS_DEPLOYMENT_ID;


const AvatarPanel =
  forwardRef(function AvatarPanel(
    {
      sessionState,
      avatarConnected,
    },
    ref
  ) {
    if (!DEPLOYMENT_ID) {
      return (
        <section className="avatar-shell">

          <div className="avatar-status">
            Tavus not configured
          </div>

          <div
            className="avatar-frame"
            style={{
              display: "grid",
              placeItems: "center",
              padding: "32px",
            }}
          >
            <p>
              Missing
              VITE_TAVUS_DEPLOYMENT_ID
            </p>
          </div>

        </section>
      );
    }


    return (
      <section className="avatar-shell">

        <div className="avatar-status">
          {avatarConnected
            ? "Avatar connected"
            : "Avatar ready"}
        </div>


        <div className="avatar-frame">

          <tavus-embed
            ref={ref}
            deployment-id={
              DEPLOYMENT_ID
            }
          />

        </div>


        <div className="avatar-state-label">
          Interaction state:{" "}
          {sessionState}
        </div>

      </section>
    );
  });


export default AvatarPanel;
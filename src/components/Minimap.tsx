import React, { useEffect, useRef } from 'react';

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const renderMinimap = () => {
      animId = requestAnimationFrame(renderMinimap);
      
      const px = (window as any)._playerX;
      const pz = (window as any)._playerZ;
      const rotation = (window as any)._playerRotationY || 0;
      
      // If player details are not initialized yet, draw loading text
      if (px === undefined || pz === undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f5ebe0';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4A4540';
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("MAP ACTIVE", canvas.width / 2, canvas.height / 2 + 2);
        return;
      }
      
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = cx - 5; // leave buffer for border
      const VIEW_RANGE = 90; // world units visible on minimap
      const scale = radius / VIEW_RANGE;
      
      // 1. Clear with procedural desert color
      ctx.clearRect(0, 0, w, h);
      
      // Create circular clipping area
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw background parchment sand texture
      ctx.fillStyle = '#F4EBE1';
      ctx.fill();
      
      // Draw topographic distance rings
      ctx.strokeStyle = '#4A454012';
      ctx.lineWidth = 1;
      [30, 60, 90].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      // Draw gridlines
      ctx.strokeStyle = '#4A454009';
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();
      
      // 2. Fetch procedural items in vicinity
      const procGroup = (window as any)._proceduralGroup;
      if (procGroup && procGroup.children) {
        procGroup.children.forEach((cellGroup: any) => {
          if (!cellGroup.children) return;
          cellGroup.children.forEach((obj: any) => {
            const userData = obj.userData;
            if (!userData) return;
            
            // Get absolute world pos of the mesh
            // Inside the cellGroup, item position is local to the cellGroup
            const wx = cellGroup.position.x + obj.position.x;
            const wz = cellGroup.position.z + obj.position.z;
            
            const dx = wx - px;
            const dz = wz - pz;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // Skip items out of minimap viewport bounds
            if (dist > VIEW_RANGE) return;
            
            const mx = cx + dx * scale;
            const my = cy + dz * scale;
            
            if (userData.type === 'crystal') {
              // Draw Glowing Amber Aura Crystal
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 4;
              ctx.fillStyle = '#d97706';
              ctx.beginPath();
              ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            } else if (userData.type === 'shrine') {
              // Draw Shrines as cyan diamonds
              ctx.fillStyle = '#06b6d4';
              ctx.beginPath();
              ctx.moveTo(mx, my - 3.5);
              ctx.lineTo(mx + 3.5, my);
              ctx.lineTo(mx, my + 3.5);
              ctx.lineTo(mx - 3.5, my);
              ctx.closePath();
              ctx.fill();
            } else if (userData.type && userData.type.startsWith('trap_')) {
              // Spikes / vortexes in soft red warning dots
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(mx, my, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });
      }
      
      // 3. Fetch handcrafted interactive assets (like Beacons, Monolith, Portals, Shards)
      const interactGroup = (window as any)._interactiveElements;
      const interactManager = (window as any)._interactionManager;
      if (interactGroup && interactGroup.children) {
        interactGroup.children.forEach((obj: any) => {
          const dx = obj.position.x - px;
          const dz = obj.position.z - pz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist <= VIEW_RANGE) {
            const mx = cx + dx * scale;
            const my = cy + dz * scale;
            
            // Resolve interaction status from global manager
            let isCompleted = false;
            let isShard = false;
            let isBeacon = false;
            
            if (interactManager && interactManager.interactables) {
              const tracking = interactManager.interactables.find((i: any) => i.mesh === obj);
              if (tracking) {
                isCompleted = tracking.isCompleted;
                isShard = tracking.type === 'shard';
                isBeacon = tracking.type === 'beacon';
              }
            }

            // Hide collected shards (gems) or activated beacons (lighthouses) from minimap
            if (isCompleted && (isShard || isBeacon)) {
              return;
            }

            // Central Monolith
            if (obj.name && obj.name.toLowerCase().includes('monolith')) {
              ctx.fillStyle = '#4b5563';
              ctx.fillRect(mx - 3.5, my - 3.5, 7, 7);
              // Draw simple inner glyph
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(mx - 1, my - 1, 2, 2);
            } else if (isShard) {
              // Gems (Shards) drawn as cyan diamonds
              ctx.fillStyle = '#06b6d4';
              ctx.beginPath();
              ctx.moveTo(mx, my - 3.5);
              ctx.lineTo(mx + 3, my);
              ctx.lineTo(mx, my + 3.5);
              ctx.lineTo(mx - 3, my);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            } else {
              // Beacon towers (Lighthouses) drawn as pulsing purple circles
              ctx.fillStyle = '#a855f7';
              ctx.beginPath();
              ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        });
      }
      
      // Restoring clipping clip
      ctx.restore();
      
      // 4. Draw Outer Brass Ancient Pathway ring frame
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Outer subtle border glow and compass ticks
      ctx.strokeStyle = '#4A454045';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw Cardinal ticks (N, S, E, W)
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 7px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("N", cx, cy - radius + 9);
      
      // 5. Draw Player Arrow at the center (rotating with character rotation angle)
      ctx.save();
      ctx.translate(cx, cy);
      // character facing yaw: invert or rotate matching ThreeJS coordinate mapping
      ctx.rotate(-rotation + Math.PI); // adjust coordinate yaw offset
      
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(0, -5.5);   // Front peak
      ctx.lineTo(4, 4);     // Bottom right
      ctx.lineTo(0, 1.5);    // Bottom inset
      ctx.lineTo(-4, 4);    // Bottom left
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    renderMinimap();
    
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);
  
  return (
    <div id="game-minimap-container" className="relative flex flex-col items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 select-none shadow-lg">
      <canvas 
        ref={canvasRef} 
        width={105} 
        height={105} 
        className="rounded-full shadow-inner block"
      />
    </div>
  );
}

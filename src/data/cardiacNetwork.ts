import { VascularNetwork } from '../types/vascular';

/**
 * Cardiac Coronary Network — nodes precisely mapped to anatomical coordinates
 * on a 900×650 canvas matching the HeartModel SVG coordinate system.
 *
 * Heart sits approximately at center: 450 x 325
 * Left ventricle apex: ~430 x 530
 * Right coronary groove: right side
 * Left coronary groove: left side
 * Aortic root: ~450 x 160
 */
export const cardiacCoronaryNetwork: VascularNetwork = {
  id: 'cardiac_coronary',
  name: 'Cardiac Coronary Anatomy (Real Heart)',
  description: 'Coronary artery network overlaid on the anatomical heart. LAD, LCx, and RCA supply the myocardium. Nanobot navigates from aortic root catheter to cardiac tumor.',
  defaultStartId: 'cc_aortic_root',
  defaultTargetId: 'cc_tumor',
  nodes: [
    // ─── Injection Site ─────────────────────────────────────────────────
    { id: 'cc_aortic_root', x: 445, y: 130, type: 'injection_site', label: 'Aortic Catheter Port' },

    // ─── Aortic Root & LMCA Takeoff ─────────────────────────────────────
    { id: 'cc_aorta_asc', x: 445, y: 165, type: 'artery', label: 'Ascending Aorta' },
    { id: 'cc_lmca', x: 405, y: 185, type: 'artery', label: 'LMCA Trunk' },

    // ─── Left Anterior Descending (LAD) — down anterior sulcus to apex ─
    { id: 'cc_lad_prox', x: 418, y: 220, type: 'artery', label: 'Proximal LAD' },
    { id: 'cc_lad_d1', x: 355, y: 265, type: 'artery', label: 'Diagonal D1' },
    { id: 'cc_lad_mid', x: 422, y: 310, type: 'artery', label: 'Mid LAD' },
    { id: 'cc_lad_d2', x: 370, y: 365, type: 'artery', label: 'Diagonal D2' },
    { id: 'cc_lad_dist', x: 430, y: 415, type: 'artery', label: 'Distal LAD' },
    { id: 'cc_lad_apex', x: 442, y: 510, type: 'artery', label: 'LAD Apex' },

    // ─── Circumflex Artery (LCx) — wraps around lateral LV wall ────────
    { id: 'cc_lcx_prox', x: 368, y: 195, type: 'artery', label: 'Proximal LCx' },
    { id: 'cc_lcx_om1', x: 305, y: 245, type: 'artery', label: 'Obtuse Marginal 1' },
    { id: 'cc_lcx_mid', x: 275, y: 310, type: 'artery', label: 'Mid LCx' },
    { id: 'cc_lcx_om2', x: 260, y: 380, type: 'artery', label: 'Obtuse Marginal 2' },
    { id: 'cc_lcx_dist', x: 285, y: 440, type: 'artery', label: 'Distal LCx' },
    { id: 'cc_pla_lcx', x: 325, y: 480, type: 'artery', label: 'Posterolateral Artery' },

    // ─── Right Coronary Artery (RCA) — down right AV sulcus to PDA ─────
    { id: 'cc_rca_prox', x: 495, y: 185, type: 'artery', label: 'Proximal RCA' },
    { id: 'cc_rca_conus', x: 550, y: 205, type: 'artery', label: 'Conus Branch' },
    { id: 'cc_rca_mid', x: 535, y: 270, type: 'artery', label: 'Mid RCA' },
    { id: 'cc_rca_am', x: 595, y: 330, type: 'artery', label: 'Acute Marginal' },
    { id: 'cc_rca_dist', x: 540, y: 395, type: 'artery', label: 'Distal RCA' },
    { id: 'cc_pda', x: 475, y: 475, type: 'artery', label: 'Posterior Descending' },
    { id: 'cc_plv', x: 510, y: 450, type: 'artery', label: 'PLV Branch' },

    // ─── Coronary Venous Return ─────────────────────────────────────────
    { id: 'cc_grcv', x: 350, y: 170, type: 'vein', label: 'Great Cardiac Vein' },
    { id: 'cc_cs', x: 430, y: 155, type: 'vein', label: 'Coronary Sinus' },
    { id: 'cc_mrcv', x: 515, y: 170, type: 'vein', label: 'Middle Cardiac Vein' },

    // ─── Septal Perforators ──────────────────────────────────────────────
    { id: 'cc_sept1', x: 428, y: 345, type: 'artery', label: 'Septal Perforator 1' },
    { id: 'cc_sept2', x: 436, y: 440, type: 'artery', label: 'Septal Perforator 2' },

    // ─── Target Tumor (Myocardial Mass — LV wall) ────────────────────────
    { id: 'cc_tumor', x: 335, y: 435, type: 'tumor', label: 'Target Cardiac Tumor' }
  ],

  edges: [
    // Aortic root → LMCA takeoff
    { source: 'cc_aortic_root', target: 'cc_aorta_asc', length: 22, radius: 12.0, blood_velocity: 22.0, flow_direction: 'source_to_target', type: 'artery', name: 'Aortic Ostium' },
    { source: 'cc_aorta_asc', target: 'cc_lmca', length: 30, radius: 6.5, blood_velocity: 19.0, flow_direction: 'source_to_target', type: 'artery', name: 'LMCA Ostium' },
    { source: 'cc_aorta_asc', target: 'cc_rca_prox', length: 40, radius: 5.5, blood_velocity: 17.0, flow_direction: 'source_to_target', type: 'artery', name: 'RCA Ostium' },

    // LMCA bifurcation → LAD + LCx
    { source: 'cc_lmca', target: 'cc_lad_prox', length: 28, radius: 5.0, blood_velocity: 17.0, flow_direction: 'source_to_target', type: 'artery', name: 'LMCA→LAD Bifurcation' },
    { source: 'cc_lmca', target: 'cc_lcx_prox', length: 22, radius: 4.5, blood_velocity: 15.0, flow_direction: 'source_to_target', type: 'artery', name: 'LMCA→LCx Bifurcation' },

    // LAD course — anterior interventricular groove (descending)
    { source: 'cc_lad_prox', target: 'cc_lad_d1', length: 48, radius: 3.5, blood_velocity: 13.0, flow_direction: 'source_to_target', type: 'artery', name: 'LAD First Diagonal (D1)' },
    { source: 'cc_lad_prox', target: 'cc_lad_mid', length: 62, radius: 4.2, blood_velocity: 14.0, flow_direction: 'source_to_target', type: 'artery', name: 'Proximal LAD Segment' },
    { source: 'cc_lad_mid', target: 'cc_lad_d2', length: 55, radius: 3.0, blood_velocity: 11.0, flow_direction: 'source_to_target', type: 'artery', name: 'LAD Second Diagonal (D2)' },
    { source: 'cc_lad_mid', target: 'cc_lad_dist', length: 70, radius: 3.8, blood_velocity: 12.0, flow_direction: 'source_to_target', type: 'artery', name: 'Mid LAD Segment' },
    { source: 'cc_lad_dist', target: 'cc_sept1', length: 45, radius: 2.5, blood_velocity: 10.0, flow_direction: 'source_to_target', type: 'artery', name: 'Septal Perforator 1' },
    { source: 'cc_lad_dist', target: 'cc_lad_apex', length: 65, radius: 3.0, blood_velocity: 10.0, flow_direction: 'source_to_target', type: 'artery', name: 'Distal LAD → Apex' },
    { source: 'cc_lad_apex', target: 'cc_sept2', length: 50, radius: 2.2, blood_velocity: 8.0, flow_direction: 'source_to_target', type: 'artery', name: 'Apical Septal Perforator' },

    // LCx course — left AV groove (wrapping posteriorly)
    { source: 'cc_lcx_prox', target: 'cc_lcx_om1', length: 66, radius: 3.8, blood_velocity: 13.0, flow_direction: 'source_to_target', type: 'artery', name: 'LCx→OM1' },
    { source: 'cc_lcx_prox', target: 'cc_lcx_mid', length: 78, radius: 4.0, blood_velocity: 12.0, flow_direction: 'source_to_target', type: 'artery', name: 'Proximal LCx Segment' },
    { source: 'cc_lcx_mid', target: 'cc_lcx_om2', length: 56, radius: 3.2, blood_velocity: 10.0, flow_direction: 'source_to_target', type: 'artery', name: 'LCx→OM2' },
    { source: 'cc_lcx_mid', target: 'cc_lcx_dist', length: 82, radius: 3.5, blood_velocity: 11.0, flow_direction: 'source_to_target', type: 'artery', name: 'Mid LCx Segment' },
    { source: 'cc_lcx_dist', target: 'cc_pla_lcx', length: 65, radius: 2.8, blood_velocity: 9.0, flow_direction: 'source_to_target', type: 'artery', name: 'LCx→PLA' },
    { source: 'cc_pla_lcx', target: 'cc_tumor', length: 45, radius: 2.5, blood_velocity: 6.5, flow_direction: 'source_to_target', type: 'artery', name: 'PLA→Tumor Feeder' },

    // RCA course — right AV groove
    { source: 'cc_rca_prox', target: 'cc_rca_conus', length: 42, radius: 3.0, blood_velocity: 13.0, flow_direction: 'source_to_target', type: 'artery', name: 'Conus Branch (RCA)' },
    { source: 'cc_rca_prox', target: 'cc_rca_mid', length: 60, radius: 5.0, blood_velocity: 16.0, flow_direction: 'source_to_target', type: 'artery', name: 'Proximal RCA Segment' },
    { source: 'cc_rca_mid', target: 'cc_rca_am', length: 50, radius: 3.5, blood_velocity: 12.0, flow_direction: 'source_to_target', type: 'artery', name: 'Acute Marginal (RCA)' },
    { source: 'cc_rca_mid', target: 'cc_rca_dist', length: 65, radius: 4.2, blood_velocity: 14.0, flow_direction: 'source_to_target', type: 'artery', name: 'Mid RCA Segment' },
    { source: 'cc_rca_dist', target: 'cc_pda', length: 70, radius: 3.5, blood_velocity: 11.0, flow_direction: 'source_to_target', type: 'artery', name: 'RCA→Posterior Descending' },
    { source: 'cc_pda', target: 'cc_sept2', length: 55, radius: 2.2, blood_velocity: 8.0, flow_direction: 'source_to_target', type: 'artery', name: 'PDA Septal Perforator' },
    { source: 'cc_pda', target: 'cc_plv', length: 48, radius: 2.8, blood_velocity: 8.5, flow_direction: 'source_to_target', type: 'artery', name: 'PDA→PLV' },
    { source: 'cc_plv', target: 'cc_tumor', length: 80, radius: 2.5, blood_velocity: 6.0, flow_direction: 'source_to_target', type: 'artery', name: 'PLV→Tumor Feeder' },

    // High-speed retrograde counter-flow segments (increases penalty — forces Dijkstra to avoid)
    { source: 'cc_rca_am', target: 'cc_lad_d2', length: 90, radius: 2.0, blood_velocity: 14.0, flow_direction: 'target_to_source', type: 'artery', name: 'Collateral Intercoronary Shunt' },
    { source: 'cc_sept1', target: 'cc_sept2', length: 60, radius: 1.8, blood_velocity: 10.0, flow_direction: 'source_to_target', type: 'artery', name: 'Inter-Septal Anastomosis' },

    // Coronary Venous Return
    { source: 'cc_lad_prox', target: 'cc_grcv', length: 38, radius: 5.5, blood_velocity: 5.5, flow_direction: 'target_to_source', type: 'vein', name: 'Great Cardiac Vein Drain' },
    { source: 'cc_lcx_mid', target: 'cc_grcv', length: 60, radius: 5.0, blood_velocity: 4.5, flow_direction: 'source_to_target', type: 'vein', name: 'Lateral Venous Tributary' },
    { source: 'cc_grcv', target: 'cc_cs', length: 42, radius: 6.5, blood_velocity: 5.0, flow_direction: 'source_to_target', type: 'vein', name: 'Great Cardiac Vein→Sinus' },
    { source: 'cc_pda', target: 'cc_mrcv', length: 55, radius: 4.5, blood_velocity: 4.5, flow_direction: 'source_to_target', type: 'vein', name: 'Middle Cardiac Vein' },
    { source: 'cc_mrcv', target: 'cc_cs', length: 38, radius: 5.8, blood_velocity: 4.8, flow_direction: 'source_to_target', type: 'vein', name: 'Middle Vein→Sinus' },

    // Anastomosis cross-links
    { source: 'cc_lad_d1', target: 'cc_lcx_om1', length: 55, radius: 2.0, blood_velocity: 6.0, flow_direction: 'source_to_target', type: 'artery', name: 'Diagonal–OM Anastomosis' },
    { source: 'cc_lad_apex', target: 'cc_pda', length: 65, radius: 2.5, blood_velocity: 7.0, flow_direction: 'source_to_target', type: 'artery', name: 'Apical Wrap Anastomosis' },
    { source: 'cc_lcx_om2', target: 'cc_pla_lcx', length: 72, radius: 2.8, blood_velocity: 7.5, flow_direction: 'source_to_target', type: 'artery', name: 'OM2–PLA Lateral Collateral' },
  ]
};

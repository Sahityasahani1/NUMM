"""
National Unified Material Master (NUMM) · Capital Arbitrage & Inter-CPSE Transfer API Router
Provides REST endpoints for national procurement arbitrage insights,
inter-CPSE inventory transfer opportunities, and autonomous agent reasoning traces.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.arbitrage_agent import ArbitrageAgent

router = APIRouter(prefix="/arbitrage", tags=["Capital Arbitrage & Transfers"])


@router.get("/summary")
def get_arbitrage_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns high-level macroeconomic arbitrage KPIs, national working capital unlocked,
    and commodity-level price spread breakdown.
    """
    return ArbitrageAgent.analyze_national_arbitrage(db)


@router.get("/opportunities")
def get_transfer_opportunities(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns prioritized list of high-value inter-CPSE stock transfer and price arbitrage opportunities.
    """
    return ArbitrageAgent.discover_transfer_opportunities(db, limit=limit)


@router.post("/simulate-transfer")
def simulate_inter_cpse_transfer(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Simulates execution of an inter-CPSE stock transfer, returning compliance clearance,
    logistics authorization, and confirmed working capital release.
    """
    transfer_id = payload.get("transfer_id")
    if not transfer_id:
        raise HTTPException(status_code=400, detail="Missing required transfer_id")
    return ArbitrageAgent.simulate_transfer(transfer_id, db=db)


@router.get("/agent-stream")
def get_autonomous_agent_trace(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executes the autonomous agent reasoning cycle, streaming step-by-step thoughts,
    analytical tool calls, observations, and strategic policy directives.
    """
    return ArbitrageAgent.run_agent_reasoning_cycle(db)

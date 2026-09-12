"""
Unit tests for Autonomous Capital Arbitrage & Inter-CPSE Transfer Agent.
Tests:
1. Macroeconomic national arbitrage analysis and price dispersion calculation.
2. Inter-CPSE transfer opportunity discovery and lead-time reduction.
3. Transfer simulation execution and compliance authorization.
4. Autonomous agent multi-tool reasoning cycle trace.
5. FastAPI /api/arbitrage endpoints.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.core.database import Base
from app.services.arbitrage_agent import ArbitrageAgent
from app.main import app

client = TestClient(app)

def test_arbitrage_agent_analysis_and_kpis():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    res = ArbitrageAgent.analyze_national_arbitrage(db)
    assert "total_national_savings_cr" in res
    assert "direct_arbitrage_savings_cr" in res
    assert "dormant_capital_unlocked_cr" in res
    assert res["total_national_savings_cr"] > 0
    assert len(res["commodity_breakdown"]) > 0


def test_discover_transfer_opportunities():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    opps = ArbitrageAgent.discover_transfer_opportunities(db, limit=5)
    assert len(opps) == 5
    for op in opps:
        assert "origin_cpse" in op
        assert "destination_cpse" in op
        assert op["origin_cpse"] != op["destination_cpse"]
        assert op["total_savings_lakhs"] > 0
        assert op["lead_time_days_saved"] > 30


def test_simulate_transfer():
    sim = ArbitrageAgent.simulate_transfer("TX-2026-0891")
    assert sim["transfer_id"] == "TX-2026-0891"
    assert sim["status"] == "SIMULATED_SUCCESS"
    assert sim["dispatch_authorization"].startswith("MoPNG-ITX-")
    assert sim["tender_eliminated"] is True


def test_run_agent_reasoning_cycle():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    trace = ArbitrageAgent.run_agent_reasoning_cycle(db)
    assert trace["execution_status"] == "COMPLETED"
    assert len(trace["reasoning_steps"]) == 5
    assert len(trace["strategic_takeaways"]) >= 3


def test_arbitrage_api_endpoints():
    res_summary = client.get("/api/arbitrage/summary")
    assert res_summary.status_code == 200
    data_summary = res_summary.json()
    assert "total_national_savings_cr" in data_summary

    res_opps = client.get("/api/arbitrage/opportunities?limit=3")
    assert res_opps.status_code == 200
    data_opps = res_opps.json()
    assert len(data_opps) == 3

    res_sim = client.post("/api/arbitrage/simulate-transfer", json={"transfer_id": "TX-TEST-01"})
    assert res_sim.status_code == 200
    data_sim = res_sim.json()
    assert data_sim["status"] == "SIMULATED_SUCCESS"

    res_stream = client.get("/api/arbitrage/agent-stream")
    assert res_stream.status_code == 200
    data_stream = res_stream.json()
    assert len(data_stream["reasoning_steps"]) > 0
